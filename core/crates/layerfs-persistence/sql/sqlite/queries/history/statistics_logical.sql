UPDATE store_totals SET logical=logical+$1 WHERE id=1 RETURNING 1;
