# Final count comparison against b1

> Status: Dated planning checkpoint; not release evidence or a product contract.

Source `5ff40d53c43da9a57b7fa963b54de40fb7d5db33`, complete core tree `b99f79e3dd972ebd6bbd1db2fc2626d08a289e19`. Derived from immutable receipts and owning CSVs; no timing comparisons.

A dash is unavailable, not zero. Status/proof columns are the owning final report. Rows marked prior evidence retain their original source/tag and do not turn a refused final attempt into a PASS. Exact metric deltas and storage axes are in [CSV](FINAL-COUNTS.csv) and [JSON](checks/final-counts.json).

| Family | Cases | b1 both checks PASS | Fresh final both PASS | Separate prior both PASS | Final owning statuses |
| --- | ---: | ---: | ---: | ---: | --- |
| init_namespace | 4 | 4 | 4 | 0 | {'INELIGIBLE': 4} |
| payload_create_read | 8 | 8 | 8 | 0 | {'INELIGIBLE': 8} |
| tiny_file_churn | 20 | 20 | 20 | 0 | {'INELIGIBLE': 20} |
| namespace_mutation | 4 | 4 | 4 | 0 | {'INELIGIBLE': 4} |
| edit_length_preserving | 12 | 12 | 11 | 1 | {'INELIGIBLE': 11, 'FAIL': 1} |
| edit_length_changing | 32 | 20 | 28 | 4 | {'FAIL': 4, 'INELIGIBLE': 28} |
| edit_length_changing_capped | 5 | 2 | 2 | 0 | {'FAIL': 3, 'INELIGIBLE': 2} |
| edit_canonical_chunk_count | 12 | 12 | 12 | 0 | {'INELIGIBLE': 12} |
| small_file_delta_smoke | 1 | 1 | 1 | 0 | {'INELIGIBLE': 1} |
| directory_construction_traversal | 12 | 12 | 12 | 0 | {'INELIGIBLE': 12} |
| git_tool_workflow | 4 | 4 | 4 | 0 | {'INELIGIBLE': 4} |
| local_snapshot | 1 | 1 | 1 | 0 | {'INELIGIBLE': 1} |
| workspace_change_locality | 16 | 15 | 16 | 0 | {'INELIGIBLE': 16} |
| file_size_transition | 7 | 6 | 6 | 0 | {'INELIGIBLE': 6, 'FAIL': 1} |
| dedup_branch_history | 26 | 21 | 21 | 0 | {'INELIGIBLE': 21, 'FAIL': 5} |
| mixed_load_bearing | 10 | 4 | 4 | 0 | {'INELIGIBLE': 4, 'FAIL': 4, 'N/A': 2} |
| branch_development | 6 | 2 | 2 | 0 | {'FAIL': 3, 'NOT_RUN': 1, 'INELIGIBLE': 2} |
| multi_workspace_development | 5 | 0 | 0 | 0 | {'FAIL': 5} |
| historical_access | 6 | 6 | 6 | 0 | {'N/A': 6} |
| dedup_cdc_locality | 21 | 20 | 20 | 0 | {'INELIGIBLE': 19, 'FAIL': 1, 'N/A': 1} |
| dedup_cross_file | 10 | 10 | 10 | 0 | {'INELIGIBLE': 10} |
| dedup_workspace_reuse | 14 | 0 | 10 | 1 | {'FAIL': 4, 'INELIGIBLE': 10} |
| store_footprint | 6 | 0 | 3 | 1 | {'FAIL': 3, 'INELIGIBLE': 3} |
| repository_history | 3 | 0 | 0 | 0 | {'NOT_RUN': 3} |
| workspace_reliability | 28 | 0 | 0 | 0 | {'N/A': 28} |

## init_namespace

| Case | Final status / proof | Evidence | Requests b1 → observed | Jobs b1 → observed | Statements b1 → observed | Overlay logical B b1 → observed |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| namespace-100-compact-v3 | INELIGIBLE / PASS | fresh receipt | — → — | — → — | — → — | — → — |
| namespace-1000-compact-v3 | INELIGIBLE / PASS | fresh receipt | — → — | — → — | — → — | — → — |
| namespace-10000 | INELIGIBLE / PASS | fresh receipt | — → — | — → — | — → — | — → — |
| namespace-100000 | INELIGIBLE / PASS | fresh receipt | — → — | — → — | — → — | — → — |

## payload_create_read

| Case | Final status / proof | Evidence | Requests b1 → observed | Jobs b1 → observed | Statements b1 → observed | Overlay logical B b1 → observed |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| payload-create-1m-compact-v2 | INELIGIBLE / PASS | fresh receipt | 22 → 22 | 177 → 177 | 922 → 922 | 1298432 → 1298432 |
| payload-create-10m-compact-v2 | INELIGIBLE / PASS | fresh receipt | 94 → 94 | 537 → 537 | 3730 → 3730 | 10899456 → 10899456 |
| payload-create-100m | INELIGIBLE / PASS | fresh receipt | 814 → 814 | 4137 → 4137 | 31810 → 31810 | 106860544 → 106860544 |
| payload-create-500m | INELIGIBLE / PASS | fresh receipt | 4014 → 4014 | 20137 → 20137 | 156610 → 156610 | 533389312 → 533389312 |
| payload-random-read-1-compact-v2 | INELIGIBLE / PASS | fresh receipt | 6 → 6 | 52 → 52 | 236 → 236 | 233472 → 233472 |
| payload-random-read-10-compact-v2 | INELIGIBLE / PASS | fresh receipt | 15 → 15 | 61 → 61 | 254 → 254 | 233472 → 233472 |
| payload-random-read-100 | INELIGIBLE / PASS | fresh receipt | 105 → 105 | 151 → 151 | 434 → 434 | 233472 → 233472 |
| payload-random-read-500 | INELIGIBLE / PASS | fresh receipt | 503 → 503 | 550 → 550 | 1232 → 1232 | 233472 → 233472 |

## tiny_file_churn

| Case | Final status / proof | Evidence | Requests b1 → observed | Jobs b1 → observed | Statements b1 → observed | Overlay logical B b1 → observed |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| tiny-create-1-compact-v2 | INELIGIBLE / PASS | fresh receipt | 16 → 16 | 140 → 140 | 645 → 645 | 233472 → 233472 |
| tiny-create-10-compact-v2 | INELIGIBLE / PASS | fresh receipt | 115 → 115 | 938 → 938 | 4380 → 4380 | 270336 → 270336 |
| tiny-create-100-mixed-v4 | INELIGIBLE / PASS | fresh receipt | 736 → 736 | 5565 → 5565 | 26688 → 26688 | 552960 → 552960 |
| tiny-create-500-mixed-v4 | INELIGIBLE / PASS | fresh receipt | 3496 → 3496 | 27941 → 27941 | 131288 → 131288 | 1847296 → 1847296 |
| tiny-stat-1-compact-v2 | INELIGIBLE / PASS | fresh receipt | 4 → 4 | 51 → 51 | 249 → 249 | 233472 → 233472 |
| tiny-stat-10-compact-v2 | INELIGIBLE / PASS | fresh receipt | 22 → 22 | 69 → 69 | 501 → 501 | 266240 → 266240 |
| tiny-stat-100-mixed-v4 | INELIGIBLE / PASS | fresh receipt | 112 → 112 | 159 → 159 | 1671 → 1671 | 393216 → 393216 |
| tiny-stat-500-mixed-v4 | INELIGIBLE / PASS | fresh receipt | 512 → 512 | 559 → 559 | 6871 → 6871 | 602112 → 602112 |
| tiny-unlink-1-compact-v2 | INELIGIBLE / PASS | fresh receipt | 12 → 12 | 122 → 122 | 594 → 594 | 233472 → 233472 |
| tiny-unlink-10-compact-v2 | INELIGIBLE / PASS | fresh receipt | 75 → 75 | 608 → 608 | 3301 → 3301 | 266240 → 266240 |
| tiny-unlink-100-mixed-v4 | INELIGIBLE / PASS | fresh receipt | 435 → 435 | 3035 → 3035 | 17991 → 17992 | 393216 → 393216 |
| tiny-unlink-500-mixed-v4 | INELIGIBLE / PASS | fresh receipt | 2035 → 2035 | 13939 → 13939 | 83655 → 83655 | 569344 → 569344 |
| tiny-bulk-create-1-compact-v2 | INELIGIBLE / PASS | fresh receipt | 1429 → 1429 | 14865 → 14865 | 64387 → 64387 | 1499136 → 1499136 |
| tiny-bulk-create-10-compact-v2 | INELIGIBLE / PASS | fresh receipt | 4651 → 4651 | 41160 → 41160 | 188401 → 188401 | 11743232 → 11743232 |
| tiny-bulk-create-100-mixed-v3 | INELIGIBLE / PASS | fresh receipt | 8709 → 8709 | 71650 → 71650 | 341790 → 341790 | 108732416 → 108732416 |
| tiny-bulk-create-500-mixed-v3 | INELIGIBLE / PASS | fresh receipt | 39665 → 39665 | 310090 → 310090 | 1505061 → 1505061 | 541523968 → 541519872 |
| tiny-bulk-delete-1-compact-v2 | INELIGIBLE / PASS | fresh receipt | 1145 → 1145 | 9966 → 9966 | 53092 → 53090 | 352256 → 352256 |
| tiny-bulk-delete-10-compact-v2 | INELIGIBLE / PASS | fresh receipt | 3012 → 3012 | 22772 → 22772 | 129868 → 129867 | 643072 → 643072 |
| tiny-bulk-delete-100-mixed-v3 | INELIGIBLE / PASS | fresh receipt | 4987 → 4987 | 36093 → 36093 | 210352 → 210351 | 925696 → 925696 |
| tiny-bulk-delete-500-mixed-v3 | INELIGIBLE / PASS | fresh receipt | 21187 → 21187 | 146056 → 146056 | 872801 → 872765 | 3276800 → 3276800 |

## namespace_mutation

| Case | Final status / proof | Evidence | Requests b1 → observed | Jobs b1 → observed | Statements b1 → observed | Overlay logical B b1 → observed |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| namespace-subtree-relocate-delete-1-compact-v2 | INELIGIBLE / PASS | fresh receipt | 129 → 129 | 890 → 890 | 5286 → 5286 | 249856 → 249856 |
| namespace-subtree-relocate-delete-10-compact-v2 | INELIGIBLE / PASS | fresh receipt | 1092 → 1092 | 7581 → 7581 | 45196 → 45196 | 385024 → 385024 |
| namespace-subtree-relocate-delete-100-mixed-v4 | INELIGIBLE / PASS | fresh receipt | 832 → 832 | 5738 → 5738 | 34260 → 34261 | 364544 → 364544 |
| namespace-subtree-relocate-delete-500-mixed-v4 | INELIGIBLE / PASS | fresh receipt | 4072 → 4072 | 27726 → 27726 | 166750 → 166751 | 811008 → 811008 |

## edit_length_preserving

| Case | Final status / proof | Evidence | Requests b1 → observed | Jobs b1 → observed | Statements b1 → observed | Overlay logical B b1 → observed |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| overwrite-head-4k-on-1mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 10 → 10 | 122 → 122 | 606 → 606 | 241664 → 241664 |
| overwrite-head-4k-on-10mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 10 → 10 | 253 → 253 | 1311 → 1311 | 262144 → 262144 |
| overwrite-head-4k-on-100mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 10 → 10 | 253 → 253 | 1311 → 1311 | 278528 → 278528 |
| overwrite-head-4k-on-500mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 10 → 10 | 352 → 352 | 1824 → 1824 | 294912 → 294912 |
| overwrite-middle-4k-on-1mib-ops-1 | FAIL / NOT_RUN | Final attempt refused before execution by existing same-treatment claim; earlier receipt remains separate | 11 → — | 145 → — | 740 → — | 245760 → — |
| overwrite-middle-4k-on-1mib-ops-1 | INELIGIBLE / PASS | prior p319-12; separate | 11 → 11 | 145 → 145 | 740 → 740 | 245760 → 245760 |
| overwrite-middle-4k-on-10mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 11 → 11 | 388 → 388 | 2015 → 2015 | 274432 → 274432 |
| overwrite-middle-4k-on-100mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 11 → 11 | 406 → 406 | 2123 → 2123 | 290816 → 290816 |
| overwrite-middle-4k-on-500mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 11 → 11 | 452 → 452 | 2375 → 2375 | 303104 → 303104 |
| overwrite-tail-4k-on-1mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 10 → 10 | 123 → 123 | 608 → 608 | 241664 → 241664 |
| overwrite-tail-4k-on-10mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 10 → 10 | 224 → 224 | 1139 → 1139 | 249856 → 249856 |
| overwrite-tail-4k-on-100mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 10 → 10 | 224 → 224 | 1139 → 1139 | 258048 → 258048 |
| overwrite-tail-4k-on-500mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 10 → 10 | 318 → 318 | 1631 → 1631 | 290816 → 290816 |

## edit_length_changing

| Case | Final status / proof | Evidence | Requests b1 → observed | Jobs b1 → observed | Statements b1 → observed | Overlay logical B b1 → observed |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| insert-middle-4k-on-1mib-ops-1 | FAIL / NOT_RUN | Final attempt refused before execution by existing same-treatment claim; earlier receipt remains separate | 27 → — | 212 → — | 1227 → — | 286720 → — |
| insert-middle-4k-on-1mib-ops-1 | INELIGIBLE / PASS | prior p319-12; separate | 27 → 27 | 212 → 160 | 1227 → 929 | 286720 → 262144 |
| insert-middle-4k-on-10mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 171 → 171 | 867 → 547 | 5522 → 4006 | 307200 → 282624 |
| insert-middle-4k-on-100mib-ops-1 | FAIL / NOT_RUN | Final attempt refused before execution by existing same-treatment claim; earlier receipt remains separate | 1611 → — | 2362 → — | 23775 → — | 323584 → — |
| insert-middle-4k-on-100mib-ops-1 | INELIGIBLE / PASS | prior p319-12; separate | 1611 → 1611 | 2362 → 2007 | 23775 → 22112 | 323584 → 299008 |
| insert-middle-4k-on-500mib-result-capped-v2-ops-1 | INELIGIBLE / PASS | fresh receipt | 8011 → 8011 | 8938 → 8455 | 104641 → 102318 | 405504 → 323584 |
| delete-middle-4k-on-1mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 24 → 24 | 157 → 157 | 934 → 934 | 258048 → 258048 |
| delete-middle-4k-on-10mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 132 → 132 | 508 → 508 | 3897 → 3897 | 278528 → 278528 |
| delete-middle-4k-on-100mib-ops-1 | FAIL / NOT_RUN | Final attempt refused before execution by existing same-treatment claim; earlier receipt remains separate | 1212 → — | 2661 → — | 26166 → — | 339968 → — |
| delete-middle-4k-on-100mib-ops-1 | INELIGIBLE / PASS | prior p319-12; separate | 1212 → 1212 | 2661 → 2661 | 26166 → 26166 | 339968 → 339968 |
| delete-middle-4k-on-500mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 6012 → 6012 | 13247 → 13247 | 127502 → 127502 | 479232 → 479232 |
| append-tail-4k-on-1mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 11 → 11 | 110 → 110 | 535 → 535 | 241664 → 241664 |
| append-tail-4k-on-10mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 11 → 11 | 133 → 133 | 658 → 658 | 241664 → 241664 |
| append-tail-4k-on-100mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 11 → 11 | 133 → 133 | 658 → 658 | 249856 → 249856 |
| append-tail-4k-on-500mib-result-capped-v2-ops-1 | INELIGIBLE / PASS | fresh receipt | 11 → 11 | 173 → 173 | 880 → 880 | 262144 → 262144 |
| prepend-head-4k-on-1mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 43 → 43 | 196 → 144 | 1233 → 935 | 299008 → 274432 |
| prepend-head-4k-on-10mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 331 → 331 | 757 → 486 | 6152 → 4825 | 303104 → 282624 |
| prepend-head-4k-on-100mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 3211 → 3211 | 3637 → 3366 | 42130 → 40803 | 311296 → 286720 |
| prepend-head-4k-on-500mib-result-capped-v2-ops-1 | INELIGIBLE / PASS | fresh receipt | 16011 → 16011 | 16582 → 16212 | 202834 → 200970 | 344064 → 294912 |
| replace-grow-middle-2k-to-4k-on-1mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 28 → 28 | 244 → 193 | 1433 → 1141 | 294912 → 274432 |
| replace-grow-middle-2k-to-4k-on-10mib-ops-1 | FAIL / NOT_RUN | Final attempt refused before execution by existing same-treatment claim; earlier receipt remains separate | 172 → — | 1376 → — | 8252 → — | 331776 → — |
| replace-grow-middle-2k-to-4k-on-10mib-ops-1 | INELIGIBLE / PASS | prior p319-12; separate | 172 → 172 | 1376 → 1055 | 8252 → 6740 | 331776 → 311296 |
| replace-grow-middle-2k-to-4k-on-100mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 1612 → 1612 | 2624 → 2261 | 27897 → 26217 | 335872 → 303104 |
| replace-grow-middle-2k-to-4k-on-500mib-result-capped-v2-ops-1 | INELIGIBLE / PASS | fresh receipt | 8012 → 8012 | 8939 → 8456 | 104658 → 102335 | 409600 → 323584 |
| replace-shrink-middle-4k-to-2k-on-1mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 24 → 24 | 188 → 188 | 1090 → 1090 | 258048 → 258048 |
| replace-shrink-middle-4k-to-2k-on-10mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 132 → 132 | 737 → 737 | 4717 → 4717 | 282624 → 282624 |
| replace-shrink-middle-4k-to-2k-on-100mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 1212 → 1212 | 1860 → 1860 | 19312 → 19312 | 299008 → 299008 |
| replace-shrink-middle-4k-to-2k-on-500mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 6012 → 6012 | 6790 → 6790 | 83980 → 83980 | 344064 → 344064 |
| truncate-tail-4k-on-1mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 10 → 10 | 106 → 106 | 521 → 521 | 237568 → 237568 |
| truncate-tail-4k-on-10mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 10 → 10 | 170 → 170 | 881 → 881 | 241664 → 241664 |
| truncate-tail-4k-on-100mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 10 → 10 | 170 → 170 | 881 → 881 | 249856 → 249856 |
| truncate-tail-4k-on-500mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 10 → 10 | 216 → 216 | 1133 → 1133 | 258048 → 258048 |
| zero-extend-tail-4k-on-1mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 11 → 11 | 110 → 110 | 535 → 535 | 241664 → 241664 |
| zero-extend-tail-4k-on-10mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 11 → 11 | 133 → 133 | 658 → 658 | 241664 → 241664 |
| zero-extend-tail-4k-on-100mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 11 → 11 | 133 → 133 | 658 → 658 | 249856 → 249856 |
| zero-extend-tail-4k-on-500mib-result-capped-v2-ops-1 | INELIGIBLE / PASS | fresh receipt | 11 → 11 | 173 → 173 | 880 → 880 | 262144 → 262144 |

## edit_length_changing_capped

| Case | Final status / proof | Evidence | Requests b1 → observed | Jobs b1 → observed | Statements b1 → observed | Overlay logical B b1 → observed |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| insert-middle-4k-input-524283904b-result-500mib-ops-1-capped-v1 | FAIL / NOT_RUN | fresh receipt | — → — | — → — | — → — | — → — |
| append-tail-4k-input-524283904b-result-500mib-ops-1-capped-v1 | INELIGIBLE / PASS | fresh receipt | 11 → 11 | 173 → 173 | 880 → 880 | 262144 → 262144 |
| prepend-head-4k-input-524283904b-result-500mib-ops-1-capped-v1 | FAIL / NOT_RUN | fresh receipt | — → — | — → — | — → — | — → — |
| replace-grow-middle-2k-to-4k-input-524285952b-result-500mib-ops-1-capped-v1 | FAIL / NOT_RUN | fresh receipt | — → — | — → — | — → — | — → — |
| zero-extend-tail-4k-input-524283904b-result-500mib-ops-1-capped-v1 | INELIGIBLE / PASS | fresh receipt | 11 → 11 | 173 → 173 | 880 → 880 | 262144 → 262144 |

## edit_canonical_chunk_count

| Case | Final status / proof | Evidence | Requests b1 → observed | Jobs b1 → observed | Statements b1 → observed | Overlay logical B b1 → observed |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| overwrite-fixed-64k-chunk-count-preserve-on-1mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 10 → 10 | 144 → 144 | 738 → 738 | 303104 → 303104 |
| overwrite-fixed-64k-chunk-count-preserve-on-10mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 10 → 10 | 347 → 347 | 1821 → 1821 | 331776 → 331776 |
| overwrite-fixed-64k-chunk-count-preserve-on-100mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 10 → 10 | 347 → 347 | 1821 → 1821 | 339968 → 339968 |
| overwrite-fixed-64k-chunk-count-preserve-on-500mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 10 → 10 | 494 → 494 | 2580 → 2580 | 376832 → 376832 |
| overwrite-fixed-64k-chunk-count-increase-on-1mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 10 → 10 | 144 → 144 | 738 → 738 | 303104 → 303104 |
| overwrite-fixed-64k-chunk-count-increase-on-10mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 10 → 10 | 347 → 347 | 1821 → 1821 | 331776 → 331776 |
| overwrite-fixed-64k-chunk-count-increase-on-100mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 10 → 10 | 347 → 347 | 1821 → 1821 | 339968 → 339968 |
| overwrite-fixed-64k-chunk-count-increase-on-500mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 10 → 10 | 494 → 494 | 2580 → 2580 | 376832 → 376832 |
| overwrite-fixed-64k-chunk-count-decrease-on-1mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 10 → 10 | 144 → 144 | 738 → 738 | 303104 → 303104 |
| overwrite-fixed-64k-chunk-count-decrease-on-10mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 10 → 10 | 347 → 347 | 1821 → 1821 | 331776 → 331776 |
| overwrite-fixed-64k-chunk-count-decrease-on-100mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 10 → 10 | 347 → 347 | 1821 → 1821 | 339968 → 339968 |
| overwrite-fixed-64k-chunk-count-decrease-on-500mib-ops-1 | INELIGIBLE / PASS | fresh receipt | 10 → 10 | 494 → 494 | 2580 → 2580 | 376832 → 376832 |

## small_file_delta_smoke

| Case | Final status / proof | Evidence | Requests b1 → observed | Jobs b1 → observed | Statements b1 → observed | Overlay logical B b1 → observed |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| small-file-delta-10x30-v1 | INELIGIBLE / PASS | fresh receipt | 402 → 402 | 2919 → 2919 | 14049 → 14049 | 290816 → 290816 |

## directory_construction_traversal

| Case | Final status / proof | Evidence | Requests b1 → observed | Jobs b1 → observed | Statements b1 → observed | Overlay logical B b1 → observed |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| directory-construct-1-compact-v2 | INELIGIBLE / PASS | fresh receipt | 16 → 16 | 171 → 171 | 761 → 761 | 233472 → 233472 |
| directory-construct-10-compact-v2 | INELIGIBLE / PASS | fresh receipt | 448 → 448 | 3683 → 3683 | 17261 → 17261 | 290816 → 290816 |
| directory-construct-100-mixed-v4 | INELIGIBLE / PASS | fresh receipt | 4408 → 4408 | 49675 → 49675 | 210008 → 210008 | 839680 → 839680 |
| directory-construct-500-mixed-v4 | INELIGIBLE / PASS | fresh receipt | 22008 → 22008 | 248100 → 248100 | 1048680 → 1048680 | 3170304 → 3170304 |
| directory-metadata-scan-1-compact-v2 | INELIGIBLE / PASS | fresh receipt | 720 → 720 | 900 → 900 | 7397 → 7397 | 233472 → 233472 |
| directory-metadata-scan-10-compact-v2 | INELIGIBLE / PASS | fresh receipt | 1219 → 1219 | 1412 → 1412 | 13736 → 13736 | 266240 → 266240 |
| directory-metadata-scan-100-mixed-v4 | INELIGIBLE / PASS | fresh receipt | 2744 → 2744 | 2962 → 2962 | 33526 → 33526 | 376832 → 376832 |
| directory-metadata-scan-500-mixed-v4 | INELIGIBLE / PASS | fresh receipt | 5864 → 5864 | 6142 → 6142 | 73786 → 73786 | 593920 → 593920 |
| directory-content-scan-1-compact-v2 | INELIGIBLE / PASS | fresh receipt | 871 → 871 | 1050 → 1050 | 8247 → 8247 | 233472 → 233472 |
| directory-content-scan-10-compact-v2 | INELIGIBLE / PASS | fresh receipt | 2720 → 2720 | 3552 → 3552 | 23516 → 23516 | 266240 → 266240 |
| directory-content-scan-100-mixed-v4 | INELIGIBLE / PASS | fresh receipt | 9144 → 9144 | 11503 → 11503 | 72608 → 72608 | 376832 → 376832 |
| directory-content-scan-500-mixed-v4 | INELIGIBLE / PASS | fresh receipt | 24063 → 24063 | 29497 → 29497 | 175496 → 175496 | 610304 → 593920 |

## git_tool_workflow

| Case | Final status / proof | Evidence | Requests b1 → observed | Jobs b1 → observed | Statements b1 → observed | Overlay logical B b1 → observed |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| git-tool-1-compact-v2 | INELIGIBLE / PASS | fresh receipt | 5895 → 5895 | 7400 → 7400 | 45673 → 45673 | 303104 → 303104 |
| git-tool-10-compact-v2 | INELIGIBLE / PASS | fresh receipt | 9394 → 9394 | 12271 → 12271 | 75281 → 75280 | 405504 → 405504 |
| git-tool-100-mixed-v4 | INELIGIBLE / PASS | fresh receipt | 51386 → 51386 | 68977 → 68977 | 415104 → 415101 | 1495040 → 1499136 |
| git-tool-500-mixed-v4 | INELIGIBLE / PASS | fresh receipt | 118171 → 118179 | 191583 → 191591 | 1071969 → 1071977 | 4894720 → 4894720 |

## local_snapshot

| Case | Final status / proof | Evidence | Requests b1 → observed | Jobs b1 → observed | Statements b1 → observed | Overlay logical B b1 → observed |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| local-snapshot-create-25000-onebyte-v1 | INELIGIBLE / PASS | fresh receipt | 177581 → 177581 | 1403960 → 1403960 | 6747991 → 6747991 | 28934144 → 28934144 |

## workspace_change_locality

| Case | Final status / proof | Evidence | Requests b1 → observed | Jobs b1 → observed | Statements b1 → observed | Overlay logical B b1 → observed |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| workspace-clean-commit-1-compact-v2 | INELIGIBLE / PASS | fresh receipt | 0 → 0 | 47 → 47 | 204 → 204 | 233472 → 233472 |
| workspace-clean-commit-10-compact-v2 | INELIGIBLE / PASS | fresh receipt | 0 → 0 | 47 → 47 | 204 → 204 | 266240 → 266240 |
| workspace-clean-commit-100-mixed-v4 | INELIGIBLE / PASS | fresh receipt | 0 → 0 | 47 → 47 | 204 → 204 | 348160 → 348160 |
| workspace-clean-commit-500-mixed-v4 | INELIGIBLE / PASS | fresh receipt | 0 → 0 | 47 → 47 | 204 → 204 | 544768 → 544768 |
| workspace-fixed-move-1-compact-v2 | INELIGIBLE / PASS | fresh receipt | 16 → 16 | 151 → 151 | 700 → 700 | 233472 → 233472 |
| workspace-fixed-move-10-compact-v2 | INELIGIBLE / PASS | fresh receipt | 16 → 16 | 151 → 151 | 700 → 700 | 266240 → 266240 |
| workspace-fixed-move-100-mixed-v4 | INELIGIBLE / PASS | fresh receipt | 16 → 16 | 151 → 151 | 700 → 700 | 348160 → 348160 |
| workspace-fixed-move-500-mixed-v4 | INELIGIBLE / PASS | fresh receipt | 16 → 16 | 151 → 151 | 700 → 700 | 544768 → 544768 |
| workspace-distributed-sdk-edit-1-compact-v2 | INELIGIBLE / PASS | fresh receipt | 12 → 12 | 94 → 94 | 444 → 444 | 237568 → 237568 |
| workspace-distributed-sdk-edit-10-compact-v2 | INELIGIBLE / PASS | fresh receipt | 75 → 75 | 418 → 418 | 2199 → 2199 | 290816 → 290816 |
| workspace-distributed-sdk-edit-100-mixed-v4 | INELIGIBLE / PASS | fresh receipt | 745 → 745 | 4113 → 4113 | 21526 → 21526 | 790528 → 790528 |
| workspace-distributed-sdk-edit-500-mixed-v4 | INELIGIBLE / PASS | fresh receipt | 3160 → 3160 | 20374 → 20374 | 100197 → 100197 | 3043328 → 3043328 |
| workspace-dense-rewrite-1-compact-v2 | INELIGIBLE / PASS | fresh receipt | 437 → 437 | 1950 → 1950 | 11504 → 11504 | 1359872 → 1359872 |
| workspace-dense-rewrite-10-compact-v2 | INELIGIBLE / PASS | fresh receipt | 3146 → 3146 | 20751 → 20751 | 104003 → 104003 | 11509760 → 11509760 |
| workspace-dense-rewrite-100-mixed-v4 | INELIGIBLE / PASS | fresh receipt | 12545 → 12545 | 84438 → 84438 | 424874 → 424874 | 109760512 → 109760512 |
| workspace-dense-rewrite-500-mixed-v4 | INELIGIBLE / PASS | fresh receipt | — → 33359 | — → 222679 | — → 1154213 | — → 541523968 |

## file_size_transition

| Case | Final status / proof | Evidence | Requests b1 → observed | Jobs b1 → observed | Statements b1 → observed | Overlay logical B b1 → observed |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| v016-boundary-small-control-v1 | INELIGIBLE / PASS | fresh receipt | 14 → 14 | 181 → 181 | 823 → 823 | 233472 → 233472 |
| v016-boundary-below-v1 | INELIGIBLE / PASS | fresh receipt | 14 → 14 | 182 → 182 | 828 → 828 | 233472 → 233472 |
| v016-boundary-exact-v1 | INELIGIBLE / PASS | fresh receipt | 14 → 14 | 261 → 261 | 1323 → 1323 | 233472 → 233472 |
| v016-boundary-above-v1 | INELIGIBLE / PASS | fresh receipt | 14 → 14 | 261 → 261 | 1323 → 1323 | 233472 → 233472 |
| v016-boundary-large-control-v1 | INELIGIBLE / PASS | fresh receipt | 14 → 14 | 261 → 261 | 1323 → 1323 | 237568 → 237568 |
| v016-boundary-roundtrip-v1 | INELIGIBLE / PASS | fresh receipt | 26 → 26 | 386 → 386 | 1836 → 1836 | 237568 → 237568 |
| v016-boundary-alias-roundtrip-v1 | FAIL / FAIL | fresh receipt | — → — | — → — | — → — | — → — |

## dedup_branch_history

| Case | Final status / proof | Evidence | Requests b1 → observed | Jobs b1 → observed | Statements b1 → observed | Overlay logical B b1 → observed |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| dedup-history-distributed-1 | INELIGIBLE / PASS | fresh receipt | 10 → 10 | 95 → 95 | 445 → 445 | 249856 → 249856 |
| dedup-history-distributed-10 | INELIGIBLE / PASS | fresh receipt | 68 → 68 | 901 → 901 | 4182 → 4182 | 249856 → 249856 |
| dedup-history-distributed-100 | INELIGIBLE / PASS | fresh receipt | 633 → 633 | 8922 → 8922 | 41276 → 41276 | 249856 → 249856 |
| dedup-history-distributed-500 | FAIL / NOT_RUN | One sample invocation failed without completed receipt; retained partial output, no retry | — → — | — → — | — → — | — → — |
| dedup-history-hotset-1 | INELIGIBLE / PASS | fresh receipt | 11 → 11 | 100 → 100 | 471 → 471 | 249856 → 249856 |
| dedup-history-hotset-10 | INELIGIBLE / PASS | fresh receipt | 201 → 201 | 1193 → 1193 | 6526 → 6526 | 249856 → 249856 |
| dedup-history-hotset-100 | INELIGIBLE / PASS | fresh receipt | 741 → 741 | 9473 → 9473 | 44236 → 44236 | 249856 → 249856 |
| dedup-history-hotset-500 | FAIL / NOT_RUN | One sample invocation failed without completed receipt; retained partial output, no retry | — → — | — → — | — → — | — → — |
| dedup-history-recurring-1 | INELIGIBLE / PASS | fresh receipt | 10 → 10 | 96 → 96 | 453 → 453 | 282624 → 282624 |
| dedup-history-recurring-10 | INELIGIBLE / PASS | fresh receipt | 55 → 55 | 880 → 880 | 4046 → 4046 | 282624 → 282624 |
| dedup-history-recurring-100 | INELIGIBLE / PASS | fresh receipt | 505 → 505 | 8710 → 8710 | 39956 → 39956 | 282624 → 282624 |
| dedup-history-recurring-500 | FAIL / NOT_RUN | One sample invocation failed without completed receipt; retained partial output, no retry | — → — | — → — | — → — | — → — |
| dedup-history-metadata-1 | INELIGIBLE / PASS | fresh receipt | 8 → 8 | 86 → 86 | 390 → 390 | 249856 → 249856 |
| dedup-history-metadata-10 | INELIGIBLE / PASS | fresh receipt | 35 → 35 | 798 → 798 | 3569 → 3569 | 249856 → 249856 |
| dedup-history-metadata-100 | INELIGIBLE / PASS | fresh receipt | 305 → 305 | 7908 → 7908 | 35339 → 35339 | 249856 → 249856 |
| dedup-history-metadata-500 | FAIL / NOT_RUN | One sample invocation failed without completed receipt; retained partial output, no retry | — → — | — → — | — → — | — → — |
| dedup-history-unrelated-1 | INELIGIBLE / PASS | fresh receipt | 2206 → 2206 | 9426 → 9426 | 48741 → 48741 | 1552384 → 1552384 |
| dedup-history-unrelated-10 | INELIGIBLE / PASS | fresh receipt | 19027 → 19027 | 90039 → 90039 | 443616 → 443616 | 1552384 → 1552384 |
| dedup-history-unrelated-100-mixed-v2 | INELIGIBLE / PASS | fresh receipt | 6315 → 6315 | 44715 → 44715 | 229852 → 229852 | 1310720 → 1310720 |
| dedup-history-unrelated-500-mixed-v2 | FAIL / NOT_RUN | One sample invocation failed without completed receipt; retained partial output, no retry | — → — | — → — | — → — | — → — |
| v016-history-large-hotset-k10-v1 | INELIGIBLE / PASS | fresh receipt | 59 → 59 | 1281 → 1281 | 6470 → 6470 | 245760 → 245760 |
| v016-history-large-hotset-k100-v1 | INELIGIBLE / PASS | fresh receipt | 539 → 539 | 12539 → 12539 | 63336 → 63336 | 245760 → 245760 |
| v016-history-namespace-inode-k10-v1 | INELIGIBLE / PASS | fresh receipt | 162 → 162 | 1660 → 1660 | 7914 → 7913 | 241664 → 241664 |
| v016-history-namespace-inode-k100-v1 | INELIGIBLE / PASS | fresh receipt | 1530 → 1530 | 16481 → 16481 | 78337 → 78337 | 241664 → 241664 |
| v016-history-boundary-cycle-k10-v1 | INELIGIBLE / PASS | fresh receipt | 115 → 115 | 1367 → 1367 | 6763 → 6763 | 237568 → 237568 |
| v016-history-boundary-cycle-k100-v1 | INELIGIBLE / PASS | fresh receipt | 1105 → 1105 | 13562 → 13562 | 67108 → 67108 | 237568 → 237568 |

## mixed_load_bearing

| Case | Final status / proof | Evidence | Requests b1 → observed | Jobs b1 → observed | Statements b1 → observed | Overlay logical B b1 → observed |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| agent-episodes-1-compact-v2 | INELIGIBLE / PASS | fresh receipt | 95 → 95 | 450 → 450 | 2328 → 2328 | 262144 → 262144 |
| agent-episodes-10-compact-v2 | INELIGIBLE / PASS | fresh receipt | 833 → 833 | 3239 → 3239 | 17728 → 17728 | 532480 → 532480 |
| agent-episodes-100 | INELIGIBLE / PASS | fresh receipt | 8213 → 8213 | 36058 → 36058 | 186472 → 186474 | 3280896 → 3280896 |
| agent-episodes-500 | INELIGIBLE / PASS | fresh receipt | 41013 → 41013 | 181071 → 181071 | 932697 → 932733 | 15437824 → 15437824 |
| v016-mixed-development-100mb-5000-k10-v1 | FAIL / FAIL | fresh receipt | — → — | — → — | — → — | — → — |
| v016-mixed-development-100mb-5000-k100-v1 | FAIL / FAIL | fresh receipt | — → — | — → — | — → — | — → — |
| v016-mixed-development-500mb-30000-k10-v1 | FAIL / FAIL | fresh receipt | — → — | — → — | — → — | — → — |
| v016-mixed-development-500mb-30000-k100-v1 | FAIL / FAIL | fresh receipt | — → — | — → — | — → — | — → — |
| v016-mixed-exhaustive-100mb-5000-k100-v1 | N/A / FAIL | fresh receipt | — → — | — → — | — → — | — → — |
| v016-mixed-exhaustive-500mb-30000-k100-v1 | N/A / NOT_RUN | NOT_RUN: one preparation expired; never retried | — → — | — → — | — → — | — → — |

## branch_development

| Case | Final status / proof | Evidence | Requests b1 → observed | Jobs b1 → observed | Statements b1 → observed | Overlay logical B b1 → observed |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| v016-branch-mixed-100mb-5000-k10-v1 | FAIL / NOT_RUN | fresh receipt | — → — | — → — | — → — | — → — |
| v016-branch-mixed-100mb-5000-k100-v1 | FAIL / NOT_RUN | fresh receipt | — → — | — → — | — → — | — → — |
| v016-branch-mixed-500mb-30000-k10-v1 | FAIL / NOT_RUN | fresh receipt | — → — | — → — | — → — | — → — |
| v016-branch-mixed-500mb-30000-k100-v1 | NOT_RUN / NOT_RUN | NOT_RUN: one preparation expired; never retried | — → — | — → — | — → — | — → — |
| v016-branch-convergent-content-v1 | INELIGIBLE / PASS | fresh receipt | 162 → 162 | 2664 → 2664 | 12058 → 12058 | 233472 → 233472 |
| v016-branch-fork-descendant-v1 | INELIGIBLE / PASS | fresh receipt | 216 → 216 | 3566 → 3566 | 16113 → 16113 | 233472 → 233472 |

## multi_workspace_development

| Case | Final status / proof | Evidence | Requests b1 → observed | Jobs b1 → observed | Statements b1 → observed | Overlay logical B b1 → observed |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| v016-workspace-mixed-100mb-5000-k10-v1 | FAIL / NOT_RUN | fresh receipt | — → — | — → — | — → — | — → — |
| v016-workspace-mixed-100mb-5000-k100-v1 | FAIL / NOT_RUN | fresh receipt | — → — | — → — | — → — | — → — |
| v016-workspace-mixed-500mb-30000-k10-v1 | FAIL / NOT_RUN | fresh receipt | — → — | — → — | — → — | — → — |
| v016-workspace-mixed-500mb-30000-k100-v1 | FAIL / NOT_RUN | fresh receipt | — → — | — → — | — → — | — → — |
| v016-workspace-four-100mb-5000-k100-v1 | FAIL / NOT_RUN | fresh receipt | — → — | — → — | — → — | — → — |

## historical_access

| Case | Final status / proof | Evidence | Requests b1 → observed | Jobs b1 → observed | Statements b1 → observed | Overlay logical B b1 → observed |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| v016-access-boundary-before-v1 | N/A / PASS | fresh receipt | UNAVAILABLE → UNAVAILABLE | UNAVAILABLE → UNAVAILABLE | UNAVAILABLE → UNAVAILABLE | 233472 → 233472 |
| v016-access-boundary-after-v1 | N/A / PASS | fresh receipt | UNAVAILABLE → UNAVAILABLE | UNAVAILABLE → UNAVAILABLE | UNAVAILABLE → UNAVAILABLE | 233472 → 233472 |
| v016-access-inode-before-v1 | N/A / PASS | fresh receipt | UNAVAILABLE → UNAVAILABLE | UNAVAILABLE → UNAVAILABLE | UNAVAILABLE → UNAVAILABLE | 233472 → 233472 |
| v016-access-inode-after-v1 | N/A / PASS | fresh receipt | UNAVAILABLE → UNAVAILABLE | UNAVAILABLE → UNAVAILABLE | UNAVAILABLE → UNAVAILABLE | 233472 → 233472 |
| v016-access-fork-point-v1 | N/A / PASS | fresh receipt | UNAVAILABLE → UNAVAILABLE | UNAVAILABLE → UNAVAILABLE | UNAVAILABLE → UNAVAILABLE | 233472 → 233472 |
| v016-access-divergent-head-v1 | N/A / PASS | fresh receipt | UNAVAILABLE → UNAVAILABLE | UNAVAILABLE → UNAVAILABLE | UNAVAILABLE → UNAVAILABLE | 233472 → 233472 |

## dedup_cdc_locality

| Case | Final status / proof | Evidence | Requests b1 → observed | Jobs b1 → observed | Statements b1 → observed | Overlay logical B b1 → observed |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| dedup-cdc-overwrite-1 | INELIGIBLE / PASS | fresh receipt | — → — | — → — | — → — | — → — |
| dedup-cdc-overwrite-10 | INELIGIBLE / PASS | fresh receipt | — → — | — → — | — → — | — → — |
| dedup-cdc-overwrite-100 | INELIGIBLE / PASS | fresh receipt | — → — | — → — | — → — | — → — |
| dedup-cdc-overwrite-500 | INELIGIBLE / PASS | fresh receipt | — → — | — → — | — → — | — → — |
| dedup-cdc-insert-1 | INELIGIBLE / PASS | fresh receipt | — → — | — → — | — → — | — → — |
| dedup-cdc-insert-10 | INELIGIBLE / PASS | fresh receipt | — → — | — → — | — → — | — → — |
| dedup-cdc-insert-100 | INELIGIBLE / PASS | fresh receipt | — → — | — → — | — → — | — → — |
| dedup-cdc-insert-500 | INELIGIBLE / PASS | fresh receipt | — → — | — → — | — → — | — → — |
| dedup-cdc-delete-1 | INELIGIBLE / PASS | fresh receipt | — → — | — → — | — → — | — → — |
| dedup-cdc-delete-10 | INELIGIBLE / PASS | fresh receipt | — → — | — → — | — → — | — → — |
| dedup-cdc-delete-100 | INELIGIBLE / PASS | fresh receipt | — → — | — → — | — → — | — → — |
| dedup-cdc-delete-500 | INELIGIBLE / PASS | fresh receipt | — → — | — → — | — → — | — → — |
| dedup-cdc-common-body-1 | INELIGIBLE / PASS | fresh receipt | — → — | — → — | — → — | — → — |
| dedup-cdc-common-body-10 | INELIGIBLE / PASS | fresh receipt | — → — | — → — | — → — | — → — |
| dedup-cdc-common-body-100 | INELIGIBLE / PASS | fresh receipt | — → — | — → — | — → — | — → — |
| dedup-cdc-common-body-500 | INELIGIBLE / PASS | fresh receipt | — → — | — → — | — → — | — → — |
| dedup-cdc-scattered-1 | INELIGIBLE / PASS | fresh receipt | — → — | — → — | — → — | — → — |
| dedup-cdc-scattered-10 | INELIGIBLE / PASS | fresh receipt | — → — | — → — | — → — | — → — |
| dedup-cdc-scattered-100 | INELIGIBLE / PASS | fresh receipt | — → — | — → — | — → — | — → — |
| dedup-cdc-scattered-500 | FAIL / FAIL | fresh receipt | — → — | — → — | — → — | — → — |
| dedup-cdc-boundaries-proof | N/A / PASS | fresh receipt | — → — | — → — | — → — | — → — |

## dedup_cross_file

| Case | Final status / proof | Evidence | Requests b1 → observed | Jobs b1 → observed | Statements b1 → observed | Overlay logical B b1 → observed |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| dedup-cross-file-anchor-1 | INELIGIBLE / PASS | fresh receipt | — → — | — → — | — → — | — → — |
| dedup-cross-file-unique-10 | INELIGIBLE / PASS | fresh receipt | — → — | — → — | — → — | — → — |
| dedup-cross-file-unique-100 | INELIGIBLE / PASS | fresh receipt | — → — | — → — | — → — | — → — |
| dedup-cross-file-unique-500 | INELIGIBLE / PASS | fresh receipt | — → — | — → — | — → — | — → — |
| dedup-cross-file-identical-10 | INELIGIBLE / PASS | fresh receipt | — → — | — → — | — → — | — → — |
| dedup-cross-file-identical-100 | INELIGIBLE / PASS | fresh receipt | — → — | — → — | — → — | — → — |
| dedup-cross-file-identical-500 | INELIGIBLE / PASS | fresh receipt | — → — | — → — | — → — | — → — |
| dedup-cross-file-mixed-10 | INELIGIBLE / PASS | fresh receipt | — → — | — → — | — → — | — → — |
| dedup-cross-file-mixed-100 | INELIGIBLE / PASS | fresh receipt | — → — | — → — | — → — | — → — |
| dedup-cross-file-mixed-500 | INELIGIBLE / PASS | fresh receipt | — → — | — → — | — → — | — → — |

## dedup_workspace_reuse

| Case | Final status / proof | Evidence | Requests b1 → observed | Jobs b1 → observed | Statements b1 → observed | Overlay logical B b1 → observed |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| dedup-workspace-exact-1-compact-v2 | FAIL / NOT_RUN | Final attempt refused before execution by existing same-treatment claim; earlier receipt remains separate | 28 → — | 186 → — | 981 → — | 1298432 → — |
| dedup-workspace-exact-1-compact-v2 | INELIGIBLE / PASS | prior p319-12; separate | 28 → 28 | 186 → 186 | 981 → 981 | 1298432 → 1298432 |
| dedup-workspace-exact-10-compact-v2 | INELIGIBLE / PASS | fresh receipt | 154 → 154 | 879 → 879 | 5607 → 5607 | 10911744 → 10911744 |
| dedup-workspace-exact-100 | INELIGIBLE / PASS | fresh receipt | 1414 → 1414 | 9008 → 9008 | 55476 → 55476 | 106946560 → 106946560 |
| dedup-workspace-exact-500 | FAIL / FAIL | fresh receipt | 7014 → 7014 | 46769 → 46769 | 282013 → 282013 | 533876736 → 533876736 |
| dedup-workspace-local-1-compact-v2 | INELIGIBLE / PASS | fresh receipt | 28 → 28 | 186 → 186 | 981 → 981 | 1298432 → 1298432 |
| dedup-workspace-local-10-compact-v2 | INELIGIBLE / PASS | fresh receipt | 154 → 154 | 879 → 879 | 5607 → 5607 | 10911744 → 10911744 |
| dedup-workspace-local-100 | INELIGIBLE / PASS | fresh receipt | 1414 → 1414 | 9008 → 9008 | 55476 → 55476 | 106946560 → 106946560 |
| dedup-workspace-local-500 | FAIL / FAIL | fresh receipt | 7014 → 7014 | 46769 → 46769 | 282013 → 282013 | 533876736 → 533876736 |
| dedup-workspace-unique-1-compact-v2 | INELIGIBLE / PASS | fresh receipt | 28 → 28 | 186 → 186 | 981 → 981 | 1298432 → 1298432 |
| dedup-workspace-unique-10-compact-v2 | INELIGIBLE / PASS | fresh receipt | 154 → 154 | 879 → 879 | 5607 → 5607 | 10911744 → 10911744 |
| dedup-workspace-unique-100 | INELIGIBLE / PASS | fresh receipt | 1414 → 1414 | 9008 → 9008 | 55476 → 55476 | 106946560 → 106946560 |
| dedup-workspace-unique-500 | FAIL / FAIL | fresh receipt | 7014 → 7014 | 46769 → 46769 | 282013 → 282013 | 533876736 → 533876736 |
| dedup-workspace-unique-1-base128-v3 | INELIGIBLE / PASS | fresh receipt | 28 → 28 | 186 → 186 | 981 → 981 | 1298432 → 1298432 |
| dedup-workspace-unique-10-base128-v3 | INELIGIBLE / PASS | fresh receipt | 154 → 154 | 879 → 879 | 5607 → 5607 | 10911744 → 10911744 |

## store_footprint

| Case | Final status / proof | Evidence | Requests b1 → observed | Jobs b1 → observed | Statements b1 → observed | Overlay logical B b1 → observed |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| store-footprint-unique-100000 | FAIL / FAIL | fresh receipt | 12 → 12 | 95 → 95 | 443 → 443 | 233472 → 233472 |
| store-footprint-metadata-cardinality-100000 | FAIL / FAIL | fresh receipt | 12 → 12 | 95 → 95 | 443 → 443 | 233472 → 233472 |
| store-footprint-large-object-500m | INELIGIBLE / PASS | fresh receipt | 12 → 12 | 281 → 281 | 1482 → 1482 | 262144 → 262144 |
| store-footprint-unique-100-low-v1 | FAIL / NOT_RUN | Final attempt refused before execution by existing same-treatment claim; earlier receipt remains separate | 12 → — | 95 → — | 443 → — | 233472 → — |
| store-footprint-unique-100-low-v1 | INELIGIBLE / PASS | prior p319-12; separate | 12 → 12 | 95 → 95 | 443 → 443 | 233472 → 233472 |
| store-footprint-metadata-cardinality-100-low-v1 | INELIGIBLE / PASS | fresh receipt | 12 → 12 | 95 → 95 | 443 → 443 | 233472 → 233472 |
| store-footprint-large-object-10m-low-v1 | INELIGIBLE / PASS | fresh receipt | 12 → 12 | 146 → 146 | 753 → 753 | 241664 → 241664 |

## repository_history

| Case | Final status / proof | Evidence | Requests b1 → observed | Jobs b1 → observed | Statements b1 → observed | Overlay logical B b1 → observed |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| deepseek-full | NOT_RUN / NOT_RUN | NOT_RUN: repository_history excluded by owner handoff | — → — | — → — | — → — | — → — |
| deepseek-stride3 | NOT_RUN / NOT_RUN | NOT_RUN: repository_history excluded by owner handoff | — → — | — → — | — → — | — → — |
| deepseek-stride10 | NOT_RUN / NOT_RUN | NOT_RUN: repository_history excluded by owner handoff | — → — | — → — | — → — | — → — |

## workspace_reliability

| Case | Final status / proof | Evidence | Requests b1 → observed | Jobs b1 → observed | Statements b1 → observed | Overlay logical B b1 → observed |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| workspace-invalid-sdk-edit-compact-v2-proof | N/A / NOT_APPLICABLE | NOT_APPLICABLE: final whole-core source review; original reason unchanged | — → — | — → — | — → — | — → — |
| workspace-invalid-namespace-compact-v2-proof | N/A / NOT_APPLICABLE | NOT_APPLICABLE: final whole-core source review; original reason unchanged | — → — | — → — | — → — | — → — |
| workspace-lease-lifecycle-compact-v2-proof | N/A / NOT_APPLICABLE | NOT_APPLICABLE: final whole-core source review; original reason unchanged | — → — | — → — | — → — | — → — |
| workspace-open-writer-busy-compact-v2-proof | N/A / NOT_APPLICABLE | NOT_APPLICABLE: final whole-core source review; original reason unchanged | — → — | — → — | — → — | — → — |
| workspace-live-execution-busy-compact-v2-proof | N/A / NOT_APPLICABLE | NOT_APPLICABLE: final whole-core source review; original reason unchanged | — → — | — → — | — → — | — → — |
| workspace-candidate-failure-retry-compact-v2-proof | N/A / NOT_APPLICABLE | NOT_APPLICABLE: final whole-core source review; original reason unchanged | — → — | — → — | — → — | — → — |
| workspace-admission-batch-failure-retry-compact-v2-proof | N/A / NOT_APPLICABLE | NOT_APPLICABLE: final whole-core source review; original reason unchanged | — → — | — → — | — → — | — → — |
| workspace-final-publication-failure-retry-compact-v2-proof | N/A / NOT_APPLICABLE | NOT_APPLICABLE: final whole-core source review; original reason unchanged | — → — | — → — | — → — | — → — |
| workspace-published-presentation-failure-smoke-v3-proof | N/A / NOT_APPLICABLE | NOT_APPLICABLE: final whole-core source review; original reason unchanged | — → — | — → — | — → — | — → — |
| workspace-dirty-end-discard-compact-v2-proof | N/A / NOT_APPLICABLE | NOT_APPLICABLE: final whole-core source review; original reason unchanged | — → — | — → — | — → — | — → — |
| workspace-dirty-net-zero-compact-v2-proof | N/A / NOT_APPLICABLE | NOT_APPLICABLE: final whole-core source review; original reason unchanged | — → — | — → — | — → — | — → — |
| workspace-short-spool-write-compact-v2-proof | N/A / NOT_APPLICABLE | NOT_APPLICABLE: final whole-core source review; original reason unchanged | — → — | — → — | — → — | — → — |
| workspace-deferred-nospace-compact-v2-proof | N/A / NOT_APPLICABLE | NOT_APPLICABLE: final whole-core source review; original reason unchanged | — → — | — → — | — → — | — → — |
| workspace-workload-cancel-compact-v2-proof | N/A / NOT_APPLICABLE | NOT_APPLICABLE: final whole-core source review; original reason unchanged | — → — | — → — | — → — | — → — |
| workspace-dirty-runtime-disconnect-compact-v2-proof | N/A / NOT_APPLICABLE | NOT_APPLICABLE: final whole-core source review; original reason unchanged | — → — | — → — | — → — | — → — |
| workspace-corrupt-descendant-compact-v2-proof | N/A / NOT_APPLICABLE | NOT_APPLICABLE: final whole-core source review; original reason unchanged | — → — | — → — | — → — | — → — |
| workspace-missing-descendant-compact-v2-proof | N/A / NOT_APPLICABLE | NOT_APPLICABLE: final whole-core source review; original reason unchanged | — → — | — → — | — → — | — → — |
| workspace-parallel-read-write-compact-v2-proof | N/A / NOT_APPLICABLE | NOT_APPLICABLE: final whole-core source review; original reason unchanged | — → — | — → — | — → — | — → — |
| workspace-shared-path-contention-compact-v2-proof | N/A / NOT_APPLICABLE | NOT_APPLICABLE: final whole-core source review; original reason unchanged | — → — | — → — | — → — | — → — |
| workspace-hardlink-alias-compact-v2-proof | N/A / NOT_APPLICABLE | NOT_APPLICABLE: final whole-core source review; original reason unchanged | — → — | — → — | — → — | — → — |
| workspace-symlink-semantics-compact-v2-proof | N/A / NOT_APPLICABLE | NOT_APPLICABLE: final whole-core source review; original reason unchanged | — → — | — → — | — → — | — → — |
| workspace-open-rename-unlink-compact-v2-proof | N/A / NOT_APPLICABLE | NOT_APPLICABLE: final whole-core source review; original reason unchanged | — → — | — → — | — → — | — → — |
| workspace-metadata-chmod-compact-v2-proof | N/A / NOT_APPLICABLE | NOT_APPLICABLE: final whole-core source review; original reason unchanged | — → — | — → — | — → — | — → — |
| workspace-metadata-mtime-compact-v2-proof | N/A / NOT_APPLICABLE | NOT_APPLICABLE: final whole-core source review; original reason unchanged | — → — | — → — | — → — | — → — |
| workspace-metadata-xattr-compact-v2-proof | N/A / NOT_APPLICABLE | NOT_APPLICABLE: final whole-core source review; original reason unchanged | — → — | — → — | — → — | — → — |
| workspace-exec-500-compact-v2-proof | N/A / NOT_APPLICABLE | NOT_APPLICABLE: final whole-core source review; original reason unchanged | — → — | — → — | — → — | — → — |
| workspace-repeat-publication-compact-v2-proof | N/A / NOT_APPLICABLE | NOT_APPLICABLE: final whole-core source review; original reason unchanged | — → — | — → — | — → — | — → — |
| workspace-sustained-600s-compact-v2-proof | N/A / NOT_APPLICABLE | NOT_APPLICABLE: final whole-core source review; original reason unchanged | — → — | — → — | — → — | — → — |
