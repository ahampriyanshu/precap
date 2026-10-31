#pragma once
#include <algorithm>
#include <atomic>
#include <chrono>
#include <cmath>
#include <concepts>
#include <condition_variable>
#include <cstddef>
#include <cstdint>
#include <deque>
#include <exception>
#include <functional>
#include <future>
#include <limits>
#include <list>
#include <map>
#include <memory>
#include <mutex>
#include <numeric>
#include <optional>
#include <queue>
#include <set>
#include <span>
#include <stdexcept>
#include <string>
#include <string_view>
#include <thread>
#include <tuple>
#include <type_traits>
#include <unordered_map>
#include <unordered_set>
#include <utility>
#include <variant>
#include <vector>
using Int = long long;
using Text = std::u32string;
template<class T> using Vec = std::vector<T>;
template<class T> using Opt = std::optional<T>;
using Strings = Vec<std::string>;
using Pair = std::pair<Int,Int>;
using Edge = std::tuple<Int,Int,Int>;
using Command = std::tuple<std::string,Int,Int>;

struct Message {std::string id,payload;bool operator==(const Message&)const=default;};
struct Delivery {std::string id,payload;Int attempt;bool operator==(const Delivery&)const=default;};
struct DeadLetter {std::string id,payload;Int attempts;bool operator==(const DeadLetter&)const=default;};
class MessageQueue { public:
 MessageQueue() { throw std::logic_error("Not implemented"); }
 bool publish(const std::string& id,const std::string& payload) { throw std::logic_error("Not implemented"); }
 Opt<Message> consume() { throw std::logic_error("Not implemented"); }
};
class MessageBroker { public:
 explicit MessageBroker(Int max_attempts=2) { throw std::logic_error("Not implemented"); }
 bool publish(const std::string& id,const std::string& payload) { throw std::logic_error("Not implemented"); }
 bool subscribe(const std::string& group) { throw std::logic_error("Not implemented"); }
 Opt<Delivery> poll(const std::string& group) { throw std::logic_error("Not implemented"); }
 bool ack(const std::string& group,const std::string& id) { throw std::logic_error("Not implemented"); }
 Opt<std::string> nack(const std::string& group,const std::string& id) { throw std::logic_error("Not implemented"); }
 Vec<DeadLetter> dead_letters(const std::string& group) const { throw std::logic_error("Not implemented"); }
};

