CREATE TABLE requests (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    request_type VARCHAR(50) NOT NULL, -- 'NAME_ENQUIRY' or 'FUNDS_TRANSFER'
    src_bank_code VARCHAR(10) NOT NULL,
    dest_bank_code VARCHAR(10) NOT NULL,
    src_account_number VARCHAR(20) NOT NULL,
    src_account_name VARCHAR(100), -- Optional for name enquiry
    dest_account_number VARCHAR(20) NOT NULL,
    dest_account_name VARCHAR(100), -- Optional for name enquiry
    amount NUMERIC(15, 2), -- For funds transfer (optional for name enquiry)
    narration TEXT, -- Funds transfer narration
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    request_timestamp TIMESTAMP NOT NULL,
    callback_url TEXT, -- Optional for name enquiry
    ip_address VARCHAR(45) NOT NULL, -- IPv4 or IPv6
    user_agent TEXT, -- Capture request user agent
    response_code VARCHAR(10), -- Response from powercard or GIP
    response_message TEXT, -- Response message
    session_id VARCHAR(50), -- Unique session tracking
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'FAILED', etc.
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT transactions_pkey PRIMARY KEY (id)
);
CREATE TABLE request_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'REQUEST_RECEIVED', 'RESPONSE_RECEIVED', 'PUSH_TO_POWERCARD', etc.
    event_details TEXT, -- JSON or detailed text describing the event
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT transaction_logs_pkey PRIMARY KEY (id)
);
CREATE TABLE file_storage (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- 'TEXT', 'XML', 'CSV', etc.
    file_content BYTEA, -- Stores the file content
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'UPLOADED', 'FAILED'
    upload_attempts INTEGER NOT NULL DEFAULT 0, -- Track retries
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT file_storage_pkey PRIMARY KEY (id)
);
CREATE TABLE approvals (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    approval_type VARCHAR(50) NOT NULL, -- 'FILE_APPROVAL', 'FUNDS_APPROVAL', etc.
    request_id UUID NOT NULL, -- References transactions.id or file_storage.id
    request_type VARCHAR(50) NOT NULL, -- 'TRANSACTION', 'FILE'
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,
    approval_date TIMESTAMP,
    expiration_date TIMESTAMP,
    comments TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT approvals_pkey PRIMARY KEY (id)
);
CREATE TABLE ftp_config (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    host VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL DEFAULT 21,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    upload_path TEXT NOT NULL, -- Directory to upload files
    is_active BOOLEAN NOT NULL DEFAULT TRUE, -- Enable/disable the configuration
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ftp_config_pkey PRIMARY KEY (id)
);

CREATE TABLE ftp_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL REFERENCES file_storage(id) ON DELETE CASCADE,
    ftp_config_id UUID NOT NULL REFERENCES ftp_config(id),
    status VARCHAR(20) NOT NULL, -- 'SUCCESS', 'FAILED'
    error_message TEXT, -- If failed, capture error
    retry_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ftp_logs_pkey PRIMARY KEY (id)
);
CREATE TABLE system_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    log_type VARCHAR(50) NOT NULL, -- 'EVENT', 'AUDIT', 'REQUEST'
    request_id UUID, -- Nullable, links to specific entities
    request_type VARCHAR(50), -- 'TRANSACTION', 'FILE', etc.
    message TEXT NOT NULL, -- Log message
    details JSONB, -- Detailed log (optional JSON format)
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT system_logs_pkey PRIMARY KEY (id)
);

CREATE OR REPLACE FUNCTION generate_unique_ids(reference_number TEXT)
RETURNS TABLE(session_id BIGINT, tracking_number BIGINT) AS $$
DECLARE
    hash_part BIGINT;
BEGIN
    -- Generate a unique hash based on the reference_number
    hash_part := abs(hashtext(reference_number)); -- Ensures a consistent hash value

    -- Generate the session_id (12 digits) using modulo and offset for fixed length
    session_id := (hash_part % 1000000000000) + 100000000000; -- Ensures 12 digits

    -- Generate the tracking_number (6 digits) using a hash combined with modulo and offset
    tracking_number := (hash_part % 1000000) + 100000; -- Ensures 6 digits

    -- Return the generated session_id and tracking_number
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

