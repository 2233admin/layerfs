-- Exact backed counts, one row per namespace, each written by the triggers
-- of that namespace's own rows. The daemon aggregate is their sum, taken
-- where it is read. Open-state cardinalities are maintained in memory.
CREATE TABLE accounting (
    ns INTEGER PRIMARY KEY CHECK(ns>=0),
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
    INSERT INTO accounting(ns,namespaces) VALUES(NEW.ns,1);
END;
CREATE TRIGGER workspace_account_delete AFTER DELETE ON workspace BEGIN
    DELETE FROM accounting WHERE ns=OLD.ns;
END;
CREATE TRIGGER inode_account_insert AFTER INSERT ON inode BEGIN
    UPDATE accounting SET inode_rows=inode_rows+1 WHERE ns=NEW.ns;
END;
CREATE TRIGGER inode_account_delete AFTER DELETE ON inode BEGIN
    UPDATE accounting SET inode_rows=inode_rows-1 WHERE ns=OLD.ns;
END;
CREATE TRIGGER directory_entry_account_insert AFTER INSERT ON directory_entry BEGIN
    UPDATE accounting SET directory_entry_rows=directory_entry_rows+1 WHERE ns=NEW.ns;
END;
CREATE TRIGGER directory_entry_account_delete AFTER DELETE ON directory_entry BEGIN
    UPDATE accounting SET directory_entry_rows=directory_entry_rows-1 WHERE ns=OLD.ns;
END;
CREATE TRIGGER payload_account_insert AFTER INSERT ON payload BEGIN
    UPDATE accounting SET payload_cells=payload_cells+1,payload_bytes=payload_bytes+(length(NEW.data)+ifnull(length(NEW.validity),0)) WHERE ns=NEW.ns;
END;
-- Before the row goes, from its stored lengths: naming OLD.data or
-- OLD.validity would make every delete load both values in full.
CREATE TRIGGER payload_account_delete BEFORE DELETE ON payload BEGIN
    UPDATE accounting SET payload_cells=payload_cells-1,payload_bytes=payload_bytes-(SELECT length(data)+ifnull(length(validity),0) FROM payload WHERE rowid=OLD.rowid) WHERE ns=OLD.ns;
END;
CREATE TRIGGER payload_reference_account_insert AFTER INSERT ON payload_reference BEGIN
    UPDATE accounting SET reference_rows=reference_rows+1 WHERE ns=NEW.ns;
END;
CREATE TRIGGER payload_reference_account_delete AFTER DELETE ON payload_reference BEGIN
    UPDATE accounting SET reference_rows=reference_rows-1 WHERE ns=OLD.ns;
END;
CREATE TRIGGER shrink_account_insert AFTER INSERT ON shrink BEGIN
    UPDATE accounting SET shrink_rows=shrink_rows+1 WHERE ns=NEW.ns;
END;
CREATE TRIGGER shrink_account_delete AFTER DELETE ON shrink BEGIN
    UPDATE accounting SET shrink_rows=shrink_rows-1 WHERE ns=OLD.ns;
END;
CREATE TRIGGER operation_record_account_insert AFTER INSERT ON operation_record BEGIN
    UPDATE accounting SET operation_record_rows=operation_record_rows+1,operation_record_bytes=operation_record_bytes+length(NEW.value) WHERE ns=NEW.ns;
END;
CREATE TRIGGER operation_record_account_delete AFTER DELETE ON operation_record BEGIN
    UPDATE accounting SET operation_record_rows=operation_record_rows-1,operation_record_bytes=operation_record_bytes-length(OLD.value) WHERE ns=OLD.ns;
END;
CREATE TRIGGER owned_operation_record_account_insert AFTER INSERT ON owned_operation_record BEGIN
    UPDATE accounting SET operation_record_rows=operation_record_rows+1,operation_record_bytes=operation_record_bytes+length(NEW.value) WHERE ns=NEW.ns;
END;
CREATE TRIGGER owned_operation_record_account_delete AFTER DELETE ON owned_operation_record BEGIN
    UPDATE accounting SET operation_record_rows=operation_record_rows-1,operation_record_bytes=operation_record_bytes-length(OLD.value) WHERE ns=OLD.ns;
END;
CREATE TRIGGER indexed_operation_record_account_insert AFTER INSERT ON indexed_operation_record BEGIN
    UPDATE accounting SET operation_record_rows=operation_record_rows+1,operation_record_bytes=operation_record_bytes+length(NEW.value) WHERE ns=NEW.ns;
END;
CREATE TRIGGER indexed_operation_record_account_delete AFTER DELETE ON indexed_operation_record BEGIN
    UPDATE accounting SET operation_record_rows=operation_record_rows-1,operation_record_bytes=operation_record_bytes-length(OLD.value) WHERE ns=OLD.ns;
END;
CREATE TRIGGER lease_account_insert AFTER INSERT ON lease BEGIN
    UPDATE accounting SET owner_rows=owner_rows+1 WHERE ns=NEW.ns;
END;
CREATE TRIGGER lease_account_delete AFTER DELETE ON lease BEGIN
    UPDATE accounting SET owner_rows=owner_rows-1 WHERE ns=OLD.ns;
END;
CREATE TRIGGER base_source_account_insert AFTER INSERT ON base_source BEGIN
    UPDATE accounting SET source_rows=source_rows+1 WHERE ns=NEW.ns;
END;
CREATE TRIGGER base_source_account_delete AFTER DELETE ON base_source BEGIN
    UPDATE accounting SET source_rows=source_rows-1 WHERE ns=OLD.ns;
END;
CREATE TRIGGER captured_reader_account_insert AFTER INSERT ON captured_reader BEGIN
    UPDATE accounting SET owner_details=owner_details+1 WHERE ns=NEW.ns;
END;
CREATE TRIGGER captured_reader_account_delete AFTER DELETE ON captured_reader BEGIN
    UPDATE accounting SET owner_details=owner_details-1 WHERE ns=OLD.ns;
END;
CREATE TRIGGER operation_owner_account_insert AFTER INSERT ON operation_owner BEGIN
    UPDATE accounting SET owner_details=owner_details+1 WHERE ns=NEW.ns;
END;
CREATE TRIGGER operation_owner_account_delete AFTER DELETE ON operation_owner BEGIN
    UPDATE accounting SET owner_details=owner_details-1 WHERE ns=OLD.ns;
END;
CREATE TRIGGER maintenance_account_insert AFTER INSERT ON maintenance BEGIN
    UPDATE accounting SET maintenance_targets=maintenance_targets+1,ready_targets=ready_targets+NEW.ready WHERE ns=NEW.ns;
END;
CREATE TRIGGER maintenance_account_delete AFTER DELETE ON maintenance BEGIN
    UPDATE accounting SET maintenance_targets=maintenance_targets-1,ready_targets=ready_targets-OLD.ready WHERE ns=OLD.ns;
END;
CREATE TRIGGER payload_account_update AFTER UPDATE ON payload BEGIN
    UPDATE accounting SET payload_bytes=payload_bytes-(length(OLD.data)+ifnull(length(OLD.validity),0))+(length(NEW.data)+ifnull(length(NEW.validity),0)) WHERE ns=NEW.ns;
END;
CREATE TRIGGER operation_record_account_update AFTER UPDATE ON operation_record BEGIN
    UPDATE accounting SET operation_record_bytes=operation_record_bytes-(length(OLD.value))+(length(NEW.value)) WHERE ns=NEW.ns;
END;
CREATE TRIGGER owned_operation_record_account_update AFTER UPDATE ON owned_operation_record BEGIN
    UPDATE accounting SET operation_record_bytes=operation_record_bytes-(length(OLD.value))+(length(NEW.value)) WHERE ns=NEW.ns;
END;
CREATE TRIGGER indexed_operation_record_account_update AFTER UPDATE ON indexed_operation_record BEGIN
    UPDATE accounting SET operation_record_bytes=operation_record_bytes-length(OLD.value)+length(NEW.value) WHERE ns=NEW.ns;
END;
CREATE TRIGGER maintenance_account_update AFTER UPDATE ON maintenance BEGIN
    UPDATE accounting SET ready_targets=ready_targets-(OLD.ready)+(NEW.ready) WHERE ns=NEW.ns;
END;
