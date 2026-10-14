INSERT INTO "commit" (commit_id, layer_stack_id, root_id, parent_commit_id, base_layer_id, second_parent_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING 1;
