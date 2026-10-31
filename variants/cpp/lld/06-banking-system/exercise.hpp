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


class BalanceAccount { public:
 BalanceAccount() { throw std::logic_error("Not implemented"); }
 Int balance() const { throw std::logic_error("Not implemented"); }
 Int deposit(Int amount) { throw std::logic_error("Not implemented"); }
 bool withdraw(Int amount) { throw std::logic_error("Not implemented"); }
};
class Bank { public:
 Bank() { throw std::logic_error("Not implemented"); }
 bool create_account(const std::string& id) { throw std::logic_error("Not implemented"); }
 Opt<Int> balance(const std::string& id) const { throw std::logic_error("Not implemented"); }
 Opt<Int> deposit(const std::string& id,Int amount) { throw std::logic_error("Not implemented"); }
 Opt<Pair> transfer(const std::string& request,const std::string& source,const std::string& target,Int amount) { throw std::logic_error("Not implemented"); }
 Vec<std::pair<std::string,Int>> top_spenders(Int limit) const { throw std::logic_error("Not implemented"); }
};

