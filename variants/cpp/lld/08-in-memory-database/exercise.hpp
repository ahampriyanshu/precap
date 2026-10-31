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


class RecordStore { public:
 RecordStore() { throw std::logic_error("Not implemented"); }
 void set(const std::string& key,const std::string& field,const std::string& value) { throw std::logic_error("Not implemented"); }
 Opt<std::string> get(const std::string& key,const std::string& field) const { throw std::logic_error("Not implemented"); }
 Vec<std::pair<std::string,std::string>> scan(const std::string& key,const std::string& prefix="") const { throw std::logic_error("Not implemented"); }
};
class TemporalDatabase { public:
 TemporalDatabase() { throw std::logic_error("Not implemented"); }
 void set(Int ts,const std::string& key,const std::string& field,const std::string& value,Opt<Int> ttl=std::nullopt) { throw std::logic_error("Not implemented"); }
 Opt<std::string> get(Int ts,const std::string& key,const std::string& field) { throw std::logic_error("Not implemented"); }
 bool erase(Int ts,const std::string& key,const std::string& field) { throw std::logic_error("Not implemented"); }
 bool compare_and_set(Int ts,const std::string& key,const std::string& field,const std::string& expected,const std::string& value,Opt<Int> ttl=std::nullopt) { throw std::logic_error("Not implemented"); }
 Vec<std::pair<std::string,std::string>> scan(Int ts,const std::string& key,const std::string& prefix="") { throw std::logic_error("Not implemented"); }
 Opt<std::string> get_at(Int ts,const std::string& key,const std::string& field,Int at) { throw std::logic_error("Not implemented"); }
};

