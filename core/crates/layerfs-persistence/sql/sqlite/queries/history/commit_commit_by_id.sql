SELECT commit_id, layer_stack_id, root_id, parent_commit_id, base_layer_id, second_parent_id FROM "commit" WHERE commit_id = $1;
