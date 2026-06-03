CREATE TABLE automation_rules (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    trigger_condition TEXT NOT NULL,
    action_payload TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    last_triggered TIMESTAMP
);

CREATE TABLE world_events (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    event_timestamp TIMESTAMP NOT NULL,
    source VARCHAR(100) NOT NULL,
    url TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE analytics_snapshots (
    id VARCHAR(50) PRIMARY KEY,
    snapshot_date DATE NOT NULL,
    life_score INT NOT NULL,
    health_metrics JSONB,
    finance_metrics JSONB,
    productivity_metrics JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tom_evolution_log (
    id VARCHAR(50) PRIMARY KEY,
    event_timestamp TIMESTAMP NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    impact_score FLOAT,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_world_events_timestamp ON world_events(event_timestamp);
CREATE INDEX idx_automation_rules_active ON automation_rules(active);
CREATE INDEX idx_tom_evolution_log_time ON tom_evolution_log(event_timestamp);
