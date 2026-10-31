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

struct File {std::string name;Int size;Opt<Int> expires_at;bool operator==(const File&)const=default;};
class FileCatalog { public:
 FileCatalog() { throw std::logic_error("Not implemented"); }
 bool upload(const std::string& name,Int size) { throw std::logic_error("Not implemented"); }
 Opt<Int> get(const std::string& name) const { throw std::logic_error("Not implemented"); }
};
class FileStorage { public:
 explicit FileStorage(Int quota) { throw std::logic_error("Not implemented"); }
 void advance_to(Int ts) { throw std::logic_error("Not implemented"); }
 bool upload(const std::string& name,Int size,Opt<Int> ttl=std::nullopt) { throw std::logic_error("Not implemented"); }
 Opt<File> get(const std::string& name) const { throw std::logic_error("Not implemented"); }
 bool copy(const std::string& source,const std::string& destination) { throw std::logic_error("Not implemented"); }
 bool erase(const std::string& name) { throw std::logic_error("Not implemented"); }
 Int usage() const { throw std::logic_error("Not implemented"); }
 Vec<File> search(const std::string& prefix,Int limit=10) const { throw std::logic_error("Not implemented"); }
};

