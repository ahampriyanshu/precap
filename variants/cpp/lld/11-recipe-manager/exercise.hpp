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

struct DraftSnapshot {std::string name;Strings ingredients,steps;bool operator==(const DraftSnapshot&)const=default;};
struct Recipe {std::string id;Int version;std::string name;Strings ingredients,steps;bool operator==(const Recipe&)const=default;};
class RecipeDraft { public:
 RecipeDraft(std::string name,Strings ingredients,Strings steps) { throw std::logic_error("Not implemented"); }
 DraftSnapshot snapshot() const { throw std::logic_error("Not implemented"); }
};
class RecipeManager { public:
 RecipeManager() { throw std::logic_error("Not implemented"); }
 bool add_user(const std::string& id,const Strings& permissions) { throw std::logic_error("Not implemented"); }
 Opt<std::string> add(const std::string& user,const std::string& name,const Strings& ingredients,const Strings& steps) { throw std::logic_error("Not implemented"); }
 Opt<Int> update(const std::string& user,const std::string& id,const std::string& name,const Strings& ingredients,const Strings& steps) { throw std::logic_error("Not implemented"); }
 Opt<Recipe> get(const std::string& user,const std::string& id,Opt<Int> version=std::nullopt) const { throw std::logic_error("Not implemented"); }
 Vec<Recipe> history(const std::string& user,const std::string& id) const { throw std::logic_error("Not implemented"); }
 Opt<Int> rollback(const std::string& user,const std::string& id,Int version) { throw std::logic_error("Not implemented"); }
 Strings by_ingredient(const std::string& user,const std::string& ingredient) const { throw std::logic_error("Not implemented"); }
};

