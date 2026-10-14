SELECT commit_id, layer_stack_id, root_id, parent_commit_id, base_layer_id, second_parent_id, branch_id, via, agent, call, merged_from_id, created_ms FROM "commit" WHERE commit_id = $1;
