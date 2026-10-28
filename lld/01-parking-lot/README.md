# Parking Lot

## The problem

A parking lot must assign a compatible free spot, issue a ticket, and free exactly that spot when the vehicle leaves. Motorcycle, car, and van spots represent increasing sizes. A small vehicle can use a larger spot, but a van cannot use a car spot. The interesting design question is who owns the rules while several operations change the same state.

The lot owns its inventory and active tickets. A ticket records the result of an allocation; it must not become an alternative way to modify the lot. Availability and active tickets must agree after every successful operation, including a release followed immediately by another arrival.

## Naive approach

Start with a list of spots and a parallel list of occupied flags. On arrival, scan for the first compatible empty spot and set its flag. On departure, clear the flag for a supplied spot number. This is a useful prototype: it makes compatibility visible and can be implemented without introducing several classes.

Shared mutable tickets create an unintended write interface:

```python
ticket = {"id": 1, "spot": "C1"}
active = {1: ticket}
ticket["spot"] = "V1"  # A caller edits the returned object.
print(active[1]["spot"])
assert active[1]["spot"] != "C1"
```

The lot now believes ticket 1 owns V1. Copying the outward record closes this alias; it does not replace validation of the identifier on release.

However, input order silently becomes the allocation policy. A motorcycle might take the only van spot even though a motorcycle spot is free. Separate flags and ticket records also require every caller to remember which updates belong together.

## Where the naive approach breaks

A duplicated arrival can reserve two spots for the same vehicle. Releasing a spot number twice can free a spot now occupied by someone else. A caller holding a mutable ticket dictionary could change its spot identifier and corrupt subsequent releases if the lot stores that same dictionary.

Failures matter too. A full lot must not consume a ticket number or leave a partial vehicle record. A duplicate vehicle should fail even if another spot is available. These are state transition rules, rather than details to patch into each user interface.

## A better design

Give `ParkingLot` sole responsibility for allocation and release. Define compatibility as a size rank, then choose the smallest compatible free kind, breaking ties by spot identifier. That policy preserves larger spaces when possible and makes results deterministic. A pure selection function is a useful collaborator even if the small implementation keeps it in the same module.

Keep allocation policy separate from the state transition. This fragment chooses a spot without reserving it:

```python
rank = {"motorcycle": 0, "car": 1, "van": 2}
free = {"V1": "van", "C1": "car", "M1": "motorcycle"}
vehicle_kind = "car"
eligible = [spot for spot, kind in free.items()
            if rank[kind] >= rank[vehicle_kind]]
chosen = min(eligible, key=lambda spot: (rank[free[spot]], spot))
print(chosen)  # C1
assert free[chosen] == "car"
```

The smallest compatible kind wins, with a stable identifier tie-break. The lot still needs to validate duplicates, handle an empty candidate set, and commit ticket and occupancy together.

Maintain three invariants: each active vehicle has one ticket, each occupied spot belongs to one active ticket, and each ticket identifier is issued only once. Validate inputs and duplicate vehicles before changing any state. When no spot fits, return a normal failure result. Release by ticket identifier so an old ticket cannot release a later occupant.

Return copies of ticket records. An implementation using a scan costs O(s) per arrival for s spots; maps can support ticket lookup and release in expected O(1). Sorted free sets can improve allocation at the cost of more bookkeeping. For a small inventory, the scan is often easier to maintain.

## Real-world usage

The same ownership pattern applies to equipment checkout and room allocation: choose a compatible resource, record an allocation, and release it through a stable handle. Real parking systems may add reservations, payment, sensors, persistence, and concurrent entry gates. Those features need explicit coordination; this in-memory design assumes calls are serialized and makes no claim about physical occupancy.

## Practice

Edit `exercise.py`. All spot and vehicle identifiers are nonempty strings. Kinds are exactly `motorcycle`, `car`, and `van`, ranked in that order. Invalid identifiers or kinds raise `ValueError` before mutation.

**Prototype:** implement `choose_spot(spots, vehicle_kind)`. `spots` is a list of `(spot_id, kind)` pairs with unique identifiers; every listed spot is free. Return the selected spot identifier or `None`. Use smallest compatible kind, then lexicographic identifier. Do not change the input. Validate every spot, including spots that cannot be selected; duplicate spot identifiers raise `ValueError`.

**Final:** implement `ParkingLot(spots)` with the same inventory validation; an empty inventory is valid. `park(vehicle_id, kind)` returns a fresh ticket dictionary with keys `ticket_id`, `vehicle_id`, `vehicle_kind`, and `spot_id`, or `None` if no compatible spot is free. Ticket numbers start at 1 and advance only on success. A vehicle with an active ticket raises `ValueError`; after release it may park again. `release(ticket_id)` accepts an integer identifier and returns the released ticket as a fresh dictionary, or `None` for an unknown or already released identifier. `active_tickets()` returns fresh dictionaries in a fresh list ordered by ticket number. `available_spots()` returns a fresh list of `(spot_id, kind)` tuples ordered by kind rank, then identifier. Separate lots own separate state. Invalid requests and capacity failures leave state and the next ticket number unchanged.

Run `python main.py --stage prototype`, then `python main.py --stage final`. The default stage is `final`; leave `main.py` unchanged.
