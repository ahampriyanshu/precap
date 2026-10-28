# Chat System

## The problem

Design direct and small-group chat with durable history and quick delivery to online devices. A sender should be able to retry after a dropped connection without creating another message. A disconnected receiver should recover the messages it missed. Within a conversation, all devices should agree on committed message order. Presence and typing indicators can be best effort; committed messages cannot depend on a particular socket staying alive.

Assume one million simultaneously connected devices and 20,000 new messages per second, averaging 1 KB. New message bodies alone consume about 1.73 TB per day before replicas, indexes, and attachments. Fanout can multiply network traffic: five online receiving devices per message implies about 100,000 live deliveries per second. Connection count, durable writes, and delivery fanout are distinct capacity dimensions.

## Naive approach

Process-local history and socket forwarding make a small demonstration work but disappear on restart. Client clocks do not define a reliable conversation order. A reconnect cursor based on the greatest received sequence has another flaw:

```pseudocode
device has applied through 8
receive sequence 10
save reconnect_cursor = 10
connection drops
reconnect(after=10)
# Sequence 9 will never be requested.
```

Receipt of 10 proves nothing about applying 9. History recovery needs a contiguous applied prefix, independently of the live delivery path.

## Where the naive approach breaks

A sender transmits “hello,” the server stores it, and the acknowledgement is lost. Retrying with a newly generated identifier creates a second message. Conversely, returning success before durable commit can leave a bubble on the sender's screen that never appears in history after a crash.

Receivers have another gap. A device observes sequences 8 and 10, then stores 10 as its reconnect cursor. Replaying after 10 permanently skips 9. Receiving 10 does not prove that the device has applied every earlier message. An online fanout system needs a durable recovery path independent of its live delivery path.

## A better design

Separate connection handling from authoritative conversation history:

```text
Client -> Gateway -> Conversation writer -> Message store
             ^               |
             +-- Fanout bus <-+
```

Gateways own sockets and subscriptions. A conversation writer authorizes senders and orders commits. Durable storage owns history and retry identities; an outbox or change stream eventually publishes committed rows to fanout. Offline devices recover from history rather than relying on socket delivery.

The minimal relational key constraints express two distinct identities:

```sql
CREATE TABLE messages (
    conversation_id text NOT NULL,
    sequence bigint NOT NULL,
    sender_id text NOT NULL,
    client_id text NOT NULL,
    body text NOT NULL,
    PRIMARY KEY (conversation_id, sequence),
    UNIQUE (conversation_id, sender_id, client_id)
);
```

The primary key fixes the committed order; the unique send identity detects retries. The schema alone does not allocate a sequence. A transactional writer must advance a conversation counter, compare content, and insert together; an independent database sequence can leave rollback gaps. A matching retry returns its original sequence; reused identity with different content fails. Membership and attachments are omitted from this schema fragment.

Use `POST /conversations/{id}/messages {client_id, text}` and history reads with `after=sequence`. Generate client ID once per user send and preserve it after timeouts. Acknowledge only after durable commit. If a writer is unavailable, delay writes instead of accepting incompatible orders in two regions. This favors clear ordering at the cost of cross-region latency and failover availability.

On reconnect, authorize again and replay after the highest contiguous applied sequence. Buffer 10 while requesting 9, then advance through both. Deduplicate replay and live events by conversation sequence. A sender retry after sequence 9’s lost acknowledgement must return 9 rather than allocate another message.

A million connections, message writes, and receiving-device fanout need independent scaling. Large broadcast rooms require different fanout and hot-partition treatment from small groups. Read replicas may lag; read-your-write routing or a minimum sequence avoids an immediately missing sent message. Track commit and delivery latency separately, reconnect replay, gaps, fanout lag, and connection churn. Check membership on both subscription and history paths; delivery and read receipts remain distinct events.

## Real-world usage

Team messaging and support chat need both durable history and live delivery. [Slack’s engineering account](https://slack.engineering/real-time-messaging/) describes separate gateway, channel, and presence responsibilities; it supports this separation without specifying the exact storage and cursor protocol above.

## Practice

### Design brief

Design direct and small-group chat for one million simultaneously connected devices and 20,000 new messages per second averaging 1 KB. Five receiving devices per message implies roughly 100,000 live deliveries per second. Require durable ordered conversation history, safe sender retries, and recovery for disconnected devices. Presence and typing may be best effort. State acknowledgement and cross-region latency expectations.

### Draw and explain

Use Excalidraw to label connection ownership, conversation ordering, durable messages, membership authorization, and live fanout. Draw separate send, online delivery, and reconnect flows. Mark retry identities, per-conversation ordering evidence, device progress, and the durable commit acknowledgement. Estimate connection, storage, and fanout capacity separately. Explain how adding gateways differs from scaling a hot conversation's writer.

### Stress the design

A message commits, but its sender acknowledgement is lost. Meanwhile, a receiving device observes sequence 10 before sequence 9. Trace the sender retry and receiver reconnect without creating a new message or skipping the gap. Next, restart a gateway serving many devices; show the recovery source and how reconnect traffic is bounded.

### Review your design

Compare one ordering authority with regional write availability and latency. Check membership on subscriptions and history reads, read-after-write behavior, and duplicate live/replay delivery. Explain how large broadcast rooms would change the design. Choose signals for commit delay, fanout lag, sequence-gap duration, connection churn, and replay pressure.
