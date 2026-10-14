-- Exact backed counts of this database's one Workspace, in the one row a
-- trigger of each of its rows seeks by a constant key. The daemon aggregate
-- is the sum over the Workspace files, taken where it is read. Open-state
-- cardinalities are maintained in memory.
CREATE TABLE accounting (
    id INTEGER PRIMARY KEY CHECK(id=1),
    namespaces INTEGER NOT NULL DEFAULT 0 CHECK(namespaces>=0),
    inode_rows INTEGER NOT NULL DEFAULT 0 CHECK(inode_rows>=0),
    directory_entry_rows INTEGER NOT NULL DEFAULT 0 CHECK(directory_entry_rows>=0),
    payload_cells INTEGER NOT NULL DEFAULT 0 CHECK(payload_cells>=0),
    payload_bytes INTEGER NOT NULL DEFAULT 0 CHECK(payload_bytes>=0),
    shrink_rows INTEGER NOT NULL DEFAULT 0 CHECK(shrink_rows>=0),
    operation_record_rows INTEGER NOT NULL DEFAULT 0 CHECK(operation_record_rows>=0),
    operation_record_bytes INTEGER NOT NULL DEFAULT 0 CHECK(operation_record_bytes>=0),
    owner_rows INTEGER NOT NULL DEFAULT 0 CHECK(owner_rows>=0),
    source_rows INTEGER NOT NULL DEFAULT 0 CHECK(source_rows>=0),
    owner_details INTEGER NOT NULL DEFAULT 0 CHECK(owner_details>=0),
    maintenance_targets INTEGER NOT NULL DEFAULT 0 CHECK(maintenance_targets>=0),
    ready_targets INTEGER NOT NULL DEFAULT 0 CHECK(ready_targets>=0),
    reference_rows INTEGER NOT NULL DEFAULT 0 CHECK(reference_rows>=0)
) STRICT;
CREATE TRIGGER workspace_account_insert AFTER INSERT ON workspace BEGIN
    INSERT INTO accounting(id,namespaces) VALUES(1,1);
END;
CREATE TRIGGER workspace_account_delete AFTER DELETE ON workspace BEGIN
    DELETE FROM accounting WHERE id=1;
END;
CREATE TRIGGER fs_inode_account_insert AFTER INSERT ON fs_inode BEGIN
    UPDATE accounting SET inode_rows=inode_rows+1 WHERE id=1;
END;
CREATE TRIGGER fs_inode_account_delete AFTER DELETE ON fs_inode BEGIN
    UPDATE accounting SET inode_rows=inode_rows-1 WHERE id=1;
END;
CREATE TRIGGER fs_entry_account_insert AFTER INSERT ON fs_entry BEGIN
    UPDATE accounting SET directory_entry_rows=directory_entry_rows+1 WHERE id=1;
END;
CREATE TRIGGER fs_entry_account_delete AFTER DELETE ON fs_entry BEGIN
    UPDATE accounting SET directory_entry_rows=directory_entry_rows-1 WHERE id=1;
END;
CREATE TRIGGER fs_data_account_insert AFTER INSERT ON fs_data BEGIN
    UPDATE accounting SET payload_cells=payload_cells+1,payload_bytes=payload_bytes+(length(NEW.data)+ifnull(length(NEW.validity),0)) WHERE id=1;
END;
-- Before the row goes, from its stored lengths: naming OLD.data or
-- OLD.validity would make every delete load both values in full.
CREATE TRIGGER fs_data_account_delete BEFORE DELETE ON fs_data BEGIN
    UPDATE accounting SET payload_cells=payload_cells-1,payload_bytes=payload_bytes-(SELECT length(data)+ifnull(length(validity),0) FROM fs_data WHERE rowid=OLD.rowid) WHERE id=1;
END;
CREATE TRIGGER fs_data_ref_account_insert AFTER INSERT ON fs_data_ref BEGIN
    UPDATE accounting SET reference_rows=reference_rows+1 WHERE id=1;
END;
CREATE TRIGGER fs_data_ref_account_delete AFTER DELETE ON fs_data_ref BEGIN
    UPDATE accounting SET reference_rows=reference_rows-1 WHERE id=1;
END;
CREATE TRIGGER fs_truncate_account_insert AFTER INSERT ON fs_truncate BEGIN
    UPDATE accounting SET shrink_rows=shrink_rows+1 WHERE id=1;
END;
CREATE TRIGGER fs_truncate_account_delete AFTER DELETE ON fs_truncate BEGIN
    UPDATE accounting SET shrink_rows=shrink_rows-1 WHERE id=1;
END;
CREATE TRIGGER commit_record_account_insert AFTER INSERT ON commit_record BEGIN
    UPDATE accounting SET operation_record_rows=operation_record_rows+1,operation_record_bytes=operation_record_bytes+length(NEW.value) WHERE id=1;
END;
CREATE TRIGGER commit_record_account_delete AFTER DELETE ON commit_record BEGIN
    UPDATE accounting SET operation_record_rows=operation_record_rows-1,operation_record_bytes=operation_record_bytes-length(OLD.value) WHERE id=1;
END;
CREATE TRIGGER commit_pin_account_insert AFTER INSERT ON commit_pin BEGIN
    UPDATE accounting SET owner_rows=owner_rows+1 WHERE id=1;
END;
CREATE TRIGGER commit_pin_account_delete AFTER DELETE ON commit_pin BEGIN
    UPDATE accounting SET owner_rows=owner_rows-1 WHERE id=1;
END;
CREATE TRIGGER commit_base_pin_account_insert AFTER INSERT ON commit_base_pin BEGIN
    UPDATE accounting SET source_rows=source_rows+1 WHERE id=1;
END;
CREATE TRIGGER commit_base_pin_account_delete AFTER DELETE ON commit_base_pin BEGIN
    UPDATE accounting SET source_rows=source_rows-1 WHERE id=1;
END;
CREATE TRIGGER commit_reader_account_insert AFTER INSERT ON commit_reader BEGIN
    UPDATE accounting SET owner_details=owner_details+1 WHERE id=1;
END;
CREATE TRIGGER commit_reader_account_delete AFTER DELETE ON commit_reader BEGIN
    UPDATE accounting SET owner_details=owner_details-1 WHERE id=1;
END;
CREATE TRIGGER commit_run_account_insert AFTER INSERT ON commit_run BEGIN
    UPDATE accounting SET owner_details=owner_details+1 WHERE id=1;
END;
CREATE TRIGGER commit_run_account_delete AFTER DELETE ON commit_run BEGIN
    UPDATE accounting SET owner_details=owner_details-1 WHERE id=1;
END;
CREATE TRIGGER cleanup_task_account_insert AFTER INSERT ON cleanup_task BEGIN
    UPDATE accounting SET maintenance_targets=maintenance_targets+1,ready_targets=ready_targets+NEW.ready WHERE id=1;
END;
CREATE TRIGGER cleanup_task_account_delete AFTER DELETE ON cleanup_task BEGIN
    UPDATE accounting SET maintenance_targets=maintenance_targets-1,ready_targets=ready_targets-OLD.ready WHERE id=1;
END;
CREATE TRIGGER fs_data_account_update AFTER UPDATE ON fs_data BEGIN
    UPDATE accounting SET payload_bytes=payload_bytes-(length(OLD.data)+ifnull(length(OLD.validity),0))+(length(NEW.data)+ifnull(length(NEW.validity),0)) WHERE id=1;
END;
CREATE TRIGGER commit_record_account_update AFTER UPDATE ON commit_record BEGIN
    UPDATE accounting SET operation_record_bytes=operation_record_bytes-length(OLD.value)+length(NEW.value) WHERE id=1;
END;
CREATE TRIGGER cleanup_task_account_update AFTER UPDATE ON cleanup_task BEGIN
    UPDATE accounting SET ready_targets=ready_targets-(OLD.ready)+(NEW.ready) WHERE id=1;
END;
