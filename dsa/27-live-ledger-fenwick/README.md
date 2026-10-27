# 27. Yesterday’s prefix sums cannot absorb today’s corrections

**Track:** Harborline algorithms · **Focus:** Fenwick trees and dynamic prefix aggregates

## The next incident

The network is rebuilt. The immutable shift report from earlier chapters now receives corrections throughout the day. Rebuilding all prefix totals after every point update makes a live dashboard stall.

**Connection:** Continue after The cable supplier quotes every pair.

## The problem behind the method

Fenwick’s 1994 paper addresses maintaining cumulative frequency tables for adaptive arithmetic compression. Updating symbol frequencies while querying cumulative totals creates the same update/query tension as our corrected demand ledger. Harborline adapts that pressure; it is not the paper’s original application. [Source: Fenwick, A New Data Structure for Cumulative Frequency Tables (1994)](https://static.aminer.org/pdf/PDF/001/073/976/a_new_data_structure_for_cumulative_frequency_tables.pdf). The city and its characters are fictional; historical claims are limited to what the source supports.

## First build the small version

Implement `prototype` using this deliberately direct approach: keep a plain list, apply corrections in O(1), and scan each requested sum range.

Both functions use the same input/output contract. For example:

```python
args = ([2, 4, 6], [('sum', 0, 3), ('add', 0, -5), ('sum', 0, 2), ('sum', 2, 2)])
expected = [12, 1, 0]
```

A static prefix table answers queries quickly but one early correction invalidates almost every later prefix. Recomputing it costs O(n) per update. Fenwick blocks let an update touch only logarithmically many stored totals.

## Now solve the real problem

Implement `solve`. Commands are ("add",index,delta) or ("sum",left,right). Return only query results. Ranges are half-open and may be empty. Values/deltas may be negative. Invalid indices/ranges/operation names raise ValueError. Mutate internal state only.

Define what interval each Fenwick cell covers and how its least-significant set bit moves between blocks. Target O((n+q) log(n+1)) time or better construction and O(n) space.

Do not change the function signatures or tests. Both stages start as stubs. Unless explicitly stated above, inputs must remain unchanged. The input is valid except for the explicitly tested errors; there is no requirement to invent additional validation rules. Functionally correct code is not by itself a proof of the stated complexity.

## Check your understanding

Before coding, write down the state you retain, the invariant it represents, and one example that defeats the direct approach. After coding, explain why the method works and when its assumptions stop holding. Do not say only “it is faster”: count the repeated work it removes.

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

`main.py` contains named boundary/counterexample cases, deterministic generated cases and input-preservation checks. Larger cases run only in the final stage. The initial stubs fail intentionally with `NotImplementedError`; no tests are silently skipped.

**Next handoff:** An increase can erase the old minimum.
