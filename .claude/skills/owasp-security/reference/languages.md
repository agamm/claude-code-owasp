# Language-Specific Security Quirks

> **Important:** The examples below are illustrative starting points, not exhaustive. When reviewing code, think like a senior security researcher: consider the language's memory model, type system, standard library pitfalls, ecosystem-specific attack vectors, and historical CVE patterns. Each language has deeper quirks beyond what's listed here.

Different languages have unique security pitfalls. This file covers the top 20 languages with key security considerations. **Go deeper for the specific language you're working in.**

## Contents
- [JavaScript / TypeScript](#javascript--typescript)
- [Python](#python)
- [Java](#java)
- [C#](#c)
- [PHP](#php)
- [Go](#go)
- [Ruby](#ruby)
- [Rust](#rust)
- [Swift](#swift)
- [Kotlin](#kotlin)
- [C / C++](#c--c)
- [Scala](#scala)
- [R](#r)
- [Perl](#perl)
- [Shell (Bash)](#shell-bash)
- [Lua](#lua)
- [Elixir](#elixir)
- [Dart / Flutter](#dart--flutter)
- [PowerShell](#powershell)
- [SQL (All Dialects)](#sql-all-dialects)

---

### JavaScript / TypeScript
**Main Risks:** Prototype pollution, XSS, eval injection
```javascript
// UNSAFE: Prototype pollution — the vector is RECURSIVE merge, not a shallow copy.
// Payload {"__proto__": {"isAdmin": true}} reaches Object.prototype for every object.
deepMerge(config, JSON.parse(body))   // lodash.merge, _.set, hand-rolled merges
// SAFE: reject the dangerous keys, or work on a prototype-less object
for (const k of ["__proto__", "constructor", "prototype"]) delete input[k];
const safe = Object.assign(Object.create(null), validated);

// UNSAFE: eval injection (and its aliases)
eval(userCode); new Function(userCode); setTimeout(userCode, 0);
// SAFE: Never build executable code from user input
```
**Watch for:** `eval()`, `new Function()`, string arguments to `setTimeout`/`setInterval`,
`innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write()`, `dangerouslySetInnerHTML`,
`location`/`href` assignment from user input, `__proto__` and `constructor.prototype`,
`postMessage` handlers without an `origin` check.

---

### Python
**Main Risks:** Pickle deserialization, format string injection, SQL/shell injection
```python
# UNSAFE: Pickle RCE
pickle.loads(user_data)
# SAFE: Use JSON or validate source
json.loads(user_data)

# UNSAFE: SQL injection via string interpolation
query = "SELECT * FROM users WHERE name = '%s'" % user_input
# SAFE: Parameterized
cursor.execute("SELECT * FROM users WHERE name = %s", (user_input,))

# UNSAFE: Format string injection — user controls the TEMPLATE, not the argument.
# "{u.__class__.__init__.__globals__[SECRET]}" walks attributes and leaks module globals.
user_template.format(u=user)
# SAFE: template is a literal, user data is an argument
"Hello {name}".format(name=user_input)
```
**Watch for:** `pickle`, `yaml.load` without `SafeLoader`, `eval()`, `exec()`, `os.system()`,
`subprocess` with `shell=True`, user-controlled format templates, `jinja2.Template(user_input)`
(SSTI), `__import__`

---

### Java
**Main Risks:** Deserialization RCE, XXE, JNDI injection
```java
// UNSAFE: Arbitrary deserialization
ObjectInputStream ois = new ObjectInputStream(userStream);
Object obj = ois.readObject();

// SAFE: Use allowlist or JSON
ObjectMapper mapper = new ObjectMapper();
mapper.readValue(json, SafeClass.class);
```
**Watch for:** `ObjectInputStream`, `Runtime.exec()`, XML parsers without XXE protection, JNDI lookups

---

### C#
**Main Risks:** Deserialization, SQL injection, path traversal
```csharp
// UNSAFE: BinaryFormatter RCE
BinaryFormatter bf = new BinaryFormatter();
object obj = bf.Deserialize(stream);

// SAFE: Use System.Text.Json
var obj = JsonSerializer.Deserialize<SafeType>(json);
```
**Watch for:** `BinaryFormatter`, `JavaScriptSerializer`, `TypeNameHandling.All`, raw SQL strings

---

### PHP
**Main Risks:** Type juggling, file inclusion, object injection
```php
// UNSAFE: Type juggling — "magic hashes" like "0e123" == "0e456" both cast to float 0
if ($password == $stored_hash) { ... }
// SAFE: Verify against a password hash (constant-time, algorithm-aware)
if (password_verify($password, $stored_hash)) { ... }
// Store with password_hash(); never md5/sha1, never your own salt scheme
$hash = password_hash($password, PASSWORD_DEFAULT);
// Comparing two known strings (tokens, HMACs, webhook signatures):
if (hash_equals($expected_token, $provided_token)) { ... }

// UNSAFE: File inclusion
include($_GET['page'] . '.php');
// SAFE: Allowlist pages
$allowed = ['home', 'about']; include(in_array($page, $allowed) ? "$page.php" : 'home.php');
```
**Watch for:** `==` vs `===`, `include/require`, `unserialize()`, `preg_replace` with `/e`, `extract()`

---

### Go
**Main Risks:** Race conditions, template injection, slice bounds
```go
// UNSAFE: Race condition
go func() { counter++ }()
// SAFE: Use sync primitives
atomic.AddInt64(&counter, 1)

// UNSAFE: Template injection
template.HTML(userInput)
// SAFE: Let template escape
{{.UserInput}}
```
**Watch for:** Goroutine data races, `template.HTML()`, `unsafe` package, unchecked slice access

---

### Ruby
**Main Risks:** Mass assignment, YAML deserialization, regex DoS
```ruby
# UNSAFE: Mass assignment
User.new(params[:user])
# SAFE: Strong parameters
User.new(params.require(:user).permit(:name, :email))

# UNSAFE: YAML RCE
YAML.load(user_input)
# SAFE: Use safe_load
YAML.safe_load(user_input)
```
**Watch for:** YAML.load, Marshal.load, eval, send with user input, .permit!

---

### Rust
**Main Risks:** Unsafe blocks, FFI boundary issues, integer overflow in release
```rust
// CAUTION: Unsafe bypasses safety
unsafe { ptr::read(user_ptr) }

// CAUTION: Integer overflow panics in debug, wraps silently in release
// (a literal `255u8 + 1` is a compile error — this only bites on runtime values)
let x: u8 = parse_user_len(input);
let y = x + 1; // panic in debug; wraps to 0 in release (overflow-checks = off)
// SAFE: Be explicit about the overflow case
let y = x.checked_add(1).ok_or(Error::TooLarge)?;
```
**Watch for:** `unsafe` blocks, FFI calls, integer overflow in release builds, `.unwrap()` on untrusted input

---

### Swift
**Main Risks:** Force unwrapping crashes, Objective-C interop
```swift
// UNSAFE: Force unwrap on untrusted data
let value = jsonDict["key"]!
// SAFE: Safe unwrapping
guard let value = jsonDict["key"] else { return }

// UNSAFE: Format string
String(format: userInput, args)
// SAFE: Don't use user input as format
```
**Watch for:** force unwrap (!), try!, ObjC bridging, NSSecureCoding misuse

---

### Kotlin
**Main Risks:** Null safety bypass, Java interop, serialization
```kotlin
// UNSAFE: Platform type from Java
val len = javaString.length // NPE if null
// SAFE: Explicit null check
val len = javaString?.length ?: 0

// UNSAFE: Reflection
clazz.getDeclaredMethod(userInput)
// SAFE: Allowlist methods
```
**Watch for:** Java interop nulls (! operator), reflection, serialization, platform types

---

### C / C++
**Main Risks:** Buffer overflow, use-after-free, format string
```c
// UNSAFE: Buffer overflow
char buf[10]; strcpy(buf, userInput);

// ALSO UNSAFE: strncpy does NOT null-terminate when src >= n
strncpy(buf, userInput, sizeof(buf) - 1);   // buf may be unterminated

// SAFE: snprintf always terminates and reports truncation
if (snprintf(buf, sizeof buf, "%s", userInput) >= (int)sizeof buf) {
    /* input was truncated — decide explicitly, don't ignore */
}

// UNSAFE: Format string
printf(userInput);
// SAFE: Always use format specifier
printf("%s", userInput);
```
**Watch for:** `strcpy`, `strncpy` (no null terminator), `sprintf`, `gets`, `alloca` with user size, pointer arithmetic, manual memory management, integer overflow in size calculations before `malloc`

---

### Scala
**Main Risks:** XML external entities, serialization, pattern matching exhaustiveness
```scala
// UNSAFE: XXE
val xml = XML.loadString(userInput)
// SAFE: Disable external entities
val factory = SAXParserFactory.newInstance()
factory.setFeature("http://xml.org/sax/features/external-general-entities", false)
```
**Watch for:** Java interop issues, XML parsing, `Serializable`, exhaustive pattern matching

---

### R
**Main Risks:** Code injection, file path manipulation
```r
# UNSAFE: eval injection
eval(parse(text = user_input))
# SAFE: Never parse user input as code

# UNSAFE: Path traversal
read.csv(paste0("data/", user_file))
# SAFE: Validate filename
if (grepl("^[a-zA-Z0-9]+\\.csv$", user_file)) read.csv(...)
```
**Watch for:** `eval()`, `parse()`, `source()`, `system()`, file path manipulation

---

### Perl
**Main Risks:** Regex injection, open() injection, taint mode bypass
```perl
# UNSAFE: Regex DoS
$input =~ /$user_pattern/;
# SAFE: Use quotemeta
$input =~ /\Q$user_pattern\E/;

# UNSAFE: open() command injection
open(FILE, $user_file);
# SAFE: Three-argument open
open(my $fh, '<', $user_file);
```
**Watch for:** Two-arg `open()`, regex from user input, backticks, `eval`, disabled taint mode

---

### Shell (Bash)
**Main Risks:** Command injection, word splitting, globbing
```bash
# UNSAFE: Unquoted variables
rm $user_file
# SAFE: Always quote
rm "$user_file"

# UNSAFE: eval
eval "$user_command"
# SAFE: Never eval user input
```
**Watch for:** Unquoted variables, `eval`, backticks, `$(...)` with user input, missing `set -euo pipefail`

---

### Lua
**Main Risks:** Sandbox escape, loadstring injection
```lua
-- UNSAFE: Code injection
loadstring(user_code)()
-- SAFE: Use sandboxed environment with restricted functions
```
**Watch for:** `loadstring`, `loadfile`, `dofile`, `os.execute`, `io` library, debug library

---

### Elixir
**Main Risks:** Atom exhaustion, code injection, ETS access
```elixir
# UNSAFE: Atom exhaustion DoS
String.to_atom(user_input)
# SAFE: Use existing atoms only
String.to_existing_atom(user_input)

# UNSAFE: Code injection
Code.eval_string(user_input)
# SAFE: Never eval user input
```
**Watch for:** `String.to_atom`, `Code.eval_string`, `:erlang.binary_to_term`, ETS public tables

---

### Dart / Flutter
**Main Risks:** Platform channel injection, insecure storage
```dart
// UNSAFE: Storing secrets in SharedPreferences
prefs.setString('auth_token', token);
// SAFE: Use flutter_secure_storage
secureStorage.write(key: 'auth_token', value: token);
```
**Watch for:** Platform channel data, `dart:mirrors`, `Function.apply`, insecure local storage

---

### PowerShell
**Main Risks:** Command injection, execution policy bypass
```powershell
# UNSAFE: Injection
Invoke-Expression $userInput
# SAFE: Avoid Invoke-Expression with user data

# UNSAFE: Unvalidated path
Get-Content $userPath
# SAFE: Validate path is within allowed directory
```
**Watch for:** `Invoke-Expression`, `& $userVar`, `Start-Process` with user args, `-ExecutionPolicy Bypass`

---

### SQL (All Dialects)
**Main Risks:** Injection, privilege escalation, data exfiltration
```sql
-- UNSAFE: String concatenation
"SELECT * FROM users WHERE id = " + userId

-- SAFE: Parameterized query (language-specific)
-- Use prepared statements in ALL cases
```
**Watch for:** Dynamic SQL, `EXECUTE IMMEDIATE`, stored procedures with dynamic queries, privilege grants
