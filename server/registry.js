// server/registry.js - Centralized Universal Programming Language Registry

export const LANGUAGE_REGISTRY = [
  // 1. General-Purpose Programming Languages
  {
    id: 'python',
    name: 'Python',
    category: 'General-purpose',
    extensions: ['.py'],
    editorMode: 'python',
    compiler: 'CPython',
    binary: 'python',
    versionArgs: ['--version'],
    capabilities: { compile: false, run: true, stdin: true, preview: false },
    starterCode: `# Python 3.14 - Universal Runtime Environment
import math

def calculate_stats(numbers):
    total = sum(numbers)
    mean = total / len(numbers)
    variance = sum((x - mean) ** 2 for x in numbers) / len(numbers)
    return mean, math.sqrt(variance)

data = [12, 45, 67, 89, 23, 56, 91]
avg, std_dev = calculate_stats(data)

print("=== DistributedOS Python Execution ===")
print(f"Dataset: {data}")
print(f"Sample Count: {len(data)}")
print(f"Arithmetic Mean: {avg:.2f}")
print(f"Standard Deviation: {std_dev:.2f}")
`
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    category: 'General-purpose',
    extensions: ['.js', '.mjs'],
    editorMode: 'javascript',
    compiler: 'V8 / Node.js',
    binary: 'node',
    versionArgs: ['--version'],
    capabilities: { compile: false, run: true, stdin: true, preview: false },
    starterCode: `// Node.js v22 - Universal Runtime Environment
console.log("=== DistributedOS Node.js Engine ===");

const clusterNodes = [
  { id: 'NodeA', role: 'Leader', ping: 0.28 },
  { id: 'NodeB', role: 'Follower', ping: 0.42 },
  { id: 'NodeC', role: 'Follower', ping: 0.35 }
];

console.log("Cluster RTT Latency Matrix:");
clusterNodes.forEach(node => {
  console.log(\`  [\${node.id}] Role: \${node.role.padEnd(8)} | RTT: \${node.ping} ms\`);
});

const totalPing = clusterNodes.reduce((acc, curr) => acc + curr.ping, 0);
console.log(\`Average Latency: \${(totalPing / clusterNodes.length).toFixed(3)} ms\`);
`
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    category: 'General-purpose',
    extensions: ['.ts'],
    editorMode: 'typescript',
    compiler: 'Node.js Native TypeScript Runner',
    binary: 'node',
    versionArgs: ['--version'],
    capabilities: { compile: false, run: true, stdin: true, preview: false },
    starterCode: `// TypeScript - Native Type Stripping Runtime
interface RaftLogEntry {
  term: number;
  index: number;
  command: string;
}

class RaftStateMachine {
  private log: RaftLogEntry[] = [];

  public append(term: number, command: string): number {
    const entry: RaftLogEntry = { term, index: this.log.length + 1, command };
    this.log.push(entry);
    return entry.index;
  }

  public getHistory(): void {
    console.log("=== Distributed Raft Log Entries ===");
    this.log.forEach(e => console.log(\`[Term \${e.term} | Index \${e.index}] \${e.command}\`));
  }
}

const sm = new RaftStateMachine();
sm.append(1, "SET cluster_name='Alpha'");
sm.append(1, "SPAWN worker_core_0");
sm.append(2, "PROMOTE NodeB TO LEADER");
sm.getHistory();
`
  },
  {
    id: 'c',
    name: 'C',
    category: 'General-purpose',
    extensions: ['.c', '.h'],
    editorMode: 'c',
    compiler: 'GCC (GNU Compiler Collection)',
    binary: 'gcc',
    versionArgs: ['--version'],
    capabilities: { compile: true, run: true, stdin: true, preview: false },
    starterCode: `// C (GCC x86-64 Engine)
#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int pid;
    const char *name;
    int priority;
} process_t;

int main() {
    printf("===========================================\\n");
    printf("  DistributedOS Kernel Process Dispatcher  \\n");
    printf("===========================================\\n");

    process_t procs[] = {
        {0, "idle_task", 0},
        {1, "raft_consensus", 2},
        {2, "vfs_worker", 1},
        {3, "rpc_server", 2}
    };

    int count = sizeof(procs) / sizeof(procs[0]);
    printf("PID   PRIORITY   PROCESS_NAME\\n");
    printf("-------------------------------\\n");
    for (int i = 0; i < count; i++) {
        printf("%-5d %-10d %s\\n", procs[i].pid, procs[i].priority, procs[i].name);
    }
    printf("\\nPreemptive Scheduler Online: 4 processes scheduled.\\n");
    return 0;
}
`
  },
  {
    id: 'cpp',
    name: 'C++',
    category: 'General-purpose',
    extensions: ['.cpp', '.hpp', '.cc'],
    editorMode: 'cpp',
    compiler: 'G++ (GNU C++ Compiler)',
    binary: 'g++',
    versionArgs: ['--version'],
    capabilities: { compile: true, run: true, stdin: true, preview: false },
    starterCode: `// C++20 (G++ Engine)
#include <iostream>
#include <vector>
#include <string>
#include <numeric>

struct ClusterNode {
    std::string name;
    int health;
    double load;
};

int main() {
    std::cout << "=== DistributedOS C++ Node Monitor ===\\n";
    
    std::vector<ClusterNode> cluster = {
        {"NodeA", 100, 14.5},
        {"NodeB", 98, 32.1},
        {"NodeC", 100, 8.4}
    };

    double totalLoad = 0;
    for (const auto& node : cluster) {
        std::cout << "Node: " << node.name 
                  << " | Health: " << node.health << "%"
                  << " | Load: " << node.load << "%\\n";
        totalLoad += node.load;
    }

    std::cout << "Cluster Average Load: " << (totalLoad / cluster.size()) << "%\\n";
    return 0;
}
`
  },
  {
    id: 'java',
    name: 'Java',
    category: 'General-purpose',
    extensions: ['.java'],
    editorMode: 'java',
    compiler: 'OpenJDK javac & JVM',
    binary: 'javac',
    versionArgs: ['-version'],
    capabilities: { compile: true, run: true, stdin: true, preview: false },
    starterCode: `// Java 25 (OpenJDK HotSpot Engine)
import java.util.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("==========================================");
        System.out.println("  DistributedOS Java Virtual Machine Task ");
        System.out.println("==========================================");

        Map<String, String> quorumConfig = new LinkedHashMap<>();
        quorumConfig.put("ClusterId", "alpha-mesh-01");
        quorumConfig.put("ConsensusProtocol", "Raft-2026");
        quorumConfig.put("HeartbeatInterval", "500ms");
        quorumConfig.put("ElectionTimeout", "1500ms-3000ms");

        for (Map.Entry<String, String> entry : quorumConfig.entrySet()) {
            System.out.printf("%-20s : %s%n", entry.getKey(), entry.getValue());
        }

        System.out.println("\\nJava Runtime Environment fully operational.");
    }
}
`
  },
  {
    id: 'rust',
    name: 'Rust',
    category: 'General-purpose',
    extensions: ['.rs'],
    editorMode: 'rust',
    compiler: 'rustc (Rust Compiler)',
    binary: 'rustc',
    versionArgs: ['--version'],
    capabilities: { compile: true, run: true, stdin: true, preview: false },
    starterCode: `// Rust (rustc Engine)
fn main() {
    println!("=========================================");
    println!("  DistributedOS Memory-Safe Rust Runner  ");
    println!("=========================================");

    let nodes = vec!["NodeA", "NodeB", "NodeC", "NodeD"];
    println!("Active quorum nodes ({} total):", nodes.len());

    for (i, node) in nodes.iter().enumerate() {
        println!("  [{}] Node ID: {} (Memory-safe borrow checked)", i + 1, node);
    }

    let memory_pages: u32 = 1024;
    let page_size_bytes: u32 = 4096;
    let total_kb = (memory_pages * page_size_bytes) / 1024;
    println!("\\nTotal Managed Memory: {} KB", total_kb);
}
`
  },
  {
    id: 'zig',
    name: 'Zig',
    category: 'Hardware and low-level languages',
    extensions: ['.zig'],
    editorMode: 'zig',
    compiler: 'Zig Compiler (zig.exe)',
    binary: 'zig',
    versionArgs: ['version'],
    capabilities: { compile: true, run: true, stdin: true, preview: false },
    starterCode: `// Zig 0.17 - Bare-Metal Systems Language
const std = @import("std");

pub fn main() !void {
    const stdout = std.io.getStdOut().writer();
    try stdout.print("=========================================\\n", .{});
    try stdout.print("   DistributedOS Zig Kernel Subsystem    \\n", .{});
    try stdout.print("=========================================\\n", .{});

    var timer_frequency: u32 = 100;
    var slice_ms: u32 = 1000 / timer_frequency;

    try stdout.print("PIT Timer Quantum: {} ms per process\\n", .{slice_ms});
    try stdout.print("Zero runtime memory leak verified.\\n", .{});
}
`
  },
  {
    id: 'clojure',
    name: 'Clojure',
    category: 'Functional and academic languages',
    extensions: ['.clj', '.cljs'],
    editorMode: 'clojure',
    compiler: 'Babashka Native Clojure Engine',
    binary: 'bb',
    versionArgs: ['--version'],
    capabilities: { compile: false, run: true, stdin: true, preview: false },
    starterCode: `; Clojure (Babashka Native Fast Engine)
(println "=== DistributedOS Clojure Lisp Environment ===")

(defn calculate-quorum [total-nodes]
  (inc (quot total-nodes 2)))

(let [nodes ["NodeA" "NodeB" "NodeC" "NodeD" "NodeE"]
      quorum (calculate-quorum (count nodes))]
  (println (str "Cluster Total Nodes: " (count nodes)))
  (println (str "Required Raft Quorum Majority: " quorum " nodes"))
  (println (str "Nodes List: " (clojure.string/join ", " nodes))))
`
  },
  {
    id: 'haskell',
    name: 'Haskell',
    category: 'Functional and academic languages',
    extensions: ['.hs'],
    editorMode: 'haskell',
    compiler: 'GHC via Haskell Stack',
    binary: 'stack',
    versionArgs: ['--version'],
    capabilities: { compile: true, run: true, stdin: true, preview: false },
    starterCode: `-- Haskell (Stack & GHC Engine)
module Main where

fib :: Integer -> Integer
fib 0 = 0
fib 1 = 1
fib n = fib (n - 1) + fib (n - 2)

main :: IO ()
main = do
    putStrLn "=== DistributedOS Pure Functional Haskell ==="
    let nodes = ["NodeA", "NodeB", "NodeC"]
    putStrLn $ "Cluster Nodes: " ++ show nodes
    putStrLn $ "Fibonacci Sequence (1..10): " ++ show (map fib [1..10])
`
  },
  {
    id: 'lua',
    name: 'Lua',
    category: 'General-purpose',
    extensions: ['.lua'],
    editorMode: 'lua',
    compiler: 'Lua 5.4 Standalone Engine',
    binary: 'lua',
    versionArgs: ['-v'],
    capabilities: { compile: false, run: true, stdin: true, preview: false },
    starterCode: `-- Lua 5.4 Embedded Scripting Engine
print("=========================================")
print("  DistributedOS Lua Kernel Extension     ")
print("=========================================")

local nodes = { "NodeA", "NodeB", "NodeC" }
for i, node in ipairs(nodes) do
    print(string.format("  [%d] Node %s -> Ping: %.2f ms", i, node, math.random() * 0.5))
end
print("Lua script executed cleanly.")
`
  },
  {
    id: 'verilog',
    name: 'Verilog HDL',
    category: 'Hardware and low-level languages',
    extensions: ['.v'],
    editorMode: 'verilog',
    compiler: 'Pyverilog HDL Hardware Simulator',
    binary: 'python',
    versionArgs: ['-c', 'import pyverilog; print("Pyverilog " + pyverilog.__version__)'],
    capabilities: { compile: true, run: true, stdin: false, preview: false },
    starterCode: `// Verilog HDL - Hardware Digital Circuit Module
module cluster_arbiter (
    input wire clk,
    input wire rst_n,
    input wire [3:0] req,
    output reg [3:0] gnt
);

  always @(posedge clk or negedge rst_n) begin
    if (!rst_n)
      gnt <= 4'b0000;
    else if (req[0])
      gnt <= 4'b0001; // NodeA has priority
    else if (req[1])
      gnt <= 4'b0010; // NodeB
    else
      gnt <= 4'b0000;
  end

endmodule
`
  },
  {
    id: 'bash',
    name: 'Bash',
    category: 'Shell and scripting',
    extensions: ['.sh', '.bash'],
    editorMode: 'shell',
    compiler: 'GNU Bash (Git Bash Environment)',
    binary: 'bash',
    versionArgs: ['--version'],
    capabilities: { compile: false, run: true, stdin: true, preview: false },
    starterCode: `#!/bin/bash
# DistributedOS POSIX Shell Environment
echo "=== DistributedOS Bash Environment ==="
echo "Host Kernel: $(uname -s 2>/dev/null || echo 'DistributedOS 1.0.4')"
echo "Process ID: $$"

for node in NodeA NodeB NodeC; do
    echo "Pinging cluster node: $node (ACK 0.28ms)"
done
echo "Bash script executed cleanly with exit code 0."
`
  },
  {
    id: 'powershell',
    name: 'PowerShell',
    category: 'Shell and scripting',
    extensions: ['.ps1'],
    editorMode: 'powershell',
    compiler: 'Windows PowerShell 5.1 / Core',
    binary: 'powershell',
    versionArgs: ['-Command', '$PSVersionTable.PSVersion.ToString()'],
    capabilities: { compile: false, run: true, stdin: true, preview: false },
    starterCode: `# PowerShell Script Execution
Write-Host "=== DistributedOS PowerShell Environment ===" -ForegroundColor Green
$nodes = @("NodeA", "NodeB", "NodeC")
foreach ($node in $nodes) {
    Write-Output ("Node " + $node + " pinged with latency 0.32ms")
}

$systemInfo = [PSCustomObject]@{
    OSName = "DistributedOS"
    Kernel = "x86_64 Monolithic"
    Uptime = "4h 12m"
}
$systemInfo | Format-Table
`
  },
  {
    id: 'batch',
    name: 'Windows Batch',
    category: 'Shell and scripting',
    extensions: ['.bat', '.cmd'],
    editorMode: 'bat',
    compiler: 'Windows Command Processor (cmd.exe)',
    binary: 'cmd',
    versionArgs: ['/c', 'ver'],
    capabilities: { compile: false, run: true, stdin: false, preview: false },
    starterCode: `@echo off
echo ===========================================
echo   DistributedOS Batch Scripting Interface
echo ===========================================
echo Initializing cluster sub-routines...
echo [OK] Checking NodeA: ONLINE
echo [OK] Checking NodeB: ONLINE
echo [OK] Checking NodeC: ONLINE
echo All systems operational.
`
  },
  {
    id: 'sqlite',
    name: 'SQLite SQL',
    category: 'Database and query languages',
    extensions: ['.sql'],
    editorMode: 'sql',
    compiler: 'SQLite 3 (In-Memory Engine via Python)',
    binary: 'python',
    versionArgs: ['-c', 'import sqlite3; print("SQLite " + sqlite3.sqlite_version)'],
    capabilities: { compile: false, run: true, stdin: false, preview: false },
    starterCode: `-- SQLite In-Memory Database Execution
CREATE TABLE cluster_nodes (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL,
    health INTEGER,
    load REAL
);

INSERT INTO cluster_nodes VALUES ('NodeA', 'Leader', 100, 14.5);
INSERT INTO cluster_nodes VALUES ('NodeB', 'Follower', 98, 34.2);
INSERT INTO cluster_nodes VALUES ('NodeC', 'Follower', 100, 8.9);

SELECT * FROM cluster_nodes WHERE health >= 90;
`
  },
  {
    id: 'html',
    name: 'HTML5 & CSS & JS',
    category: 'Web development',
    extensions: ['.html'],
    editorMode: 'html',
    compiler: 'Browser Web Engine (Client-side Sandbox Preview)',
    binary: 'web',
    versionArgs: [],
    capabilities: { compile: false, run: true, stdin: false, preview: true },
    starterCode: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; background: #0f172a; color: #f8fafc; padding: 24px; }
    h1 { color: #38bdf8; }
    .card { background: #1e293b; padding: 16px; border-radius: 8px; border: 1px solid #334155; }
    button { background: #10b981; color: #000; border: none; padding: 10px 18px; border-radius: 6px; font-weight: bold; cursor: pointer; }
    button:hover { background: #059669; }
  </style>
</head>
<body>
  <h1>DistributedOS Live Web Sandbox</h1>
  <div class="card">
    <p>This web document is running inside a secure isolated sandbox iframe!</p>
    <button onclick="alert('Hello from DistributedOS Web Engine!')">Click for Interactive Alert</button>
  </div>
</body>
</html>
`
  },
  {
    id: 'fortran',
    name: 'Fortran',
    category: 'Scientific and numerical computing',
    extensions: ['.f90', '.f95'],
    editorMode: 'fortran',
    compiler: 'GNU Fortran (gfortran)',
    binary: 'gfortran',
    versionArgs: ['--version'],
    capabilities: { compile: true, run: true, stdin: true, preview: false },
    starterCode: `program hello
  print *, "DistributedOS High Performance Fortran"
end program hello`
  },
  {
    id: 'asm_x86',
    name: 'Assembly (x86 NASM)',
    category: 'Hardware and low-level languages',
    extensions: ['.asm', '.s'],
    editorMode: 'assembly',
    compiler: 'NASM (Netwide Assembler)',
    binary: 'nasm',
    versionArgs: ['-v'],
    capabilities: { compile: true, run: true, stdin: false, preview: false },
    starterCode: `section .data
    msg db 'DistributedOS Bare-Metal ASM', 0xa
    len equ $ - msg

section .text
    global _start

_start:
    mov edx, len
    mov ecx, msg
    mov ebx, 1
    mov eax, 4
    int 0x80

    mov eax, 1
    int 0x80`
  },
  {
    id: 'json',
    name: 'JSON',
    category: 'Configuration and data formats',
    extensions: ['.json'],
    editorMode: 'json',
    compiler: 'Built-in JSON Validator',
    binary: 'node',
    versionArgs: ['--version'],
    capabilities: { compile: false, run: true, stdin: false, preview: false },
    starterCode: `{
  "system": "DistributedOS",
  "version": "1.0.4",
  "quorum": {
    "leader": "NodeA",
    "term": 1,
    "active_nodes": 3
  }
}`
  },
  {
    id: 'yaml',
    name: 'YAML',
    category: 'Configuration and data formats',
    extensions: ['.yaml', '.yml'],
    editorMode: 'yaml',
    compiler: 'YAML Parser (Python Engine)',
    binary: 'python',
    versionArgs: ['-c', 'import yaml; print("PyYAML available")'],
    capabilities: { compile: false, run: true, stdin: false, preview: false },
    starterCode: `cluster:
  name: distributed-os-prod
  nodes:
    - id: NodeA
      role: leader
    - id: NodeB
      role: follower
`
  },
  {
    id: 'elixir',
    name: 'Elixir',
    category: 'Functional and academic languages',
    extensions: ['.ex', '.exs'],
    editorMode: 'elixir',
    compiler: 'Elixir / BEAM VM',
    binary: 'elixir',
    versionArgs: ['--version'],
    capabilities: { compile: false, run: true, stdin: true, preview: false },
    starterCode: `IO.puts("DistributedOS Elixir Actor Model")`
  },
  {
    id: 'go',
    name: 'Go',
    category: 'General-purpose',
    extensions: ['.go'],
    editorMode: 'golang',
    compiler: 'Go Toolchain (gc)',
    binary: 'go',
    versionArgs: ['version'],
    capabilities: { compile: true, run: true, stdin: true, preview: false },
    starterCode: `package main\nimport "fmt"\nfunc main() {\n    fmt.Println("DistributedOS Raft Consensus Engine (Go)")\n}`
  },
  {
    id: 'ruby',
    name: 'Ruby',
    category: 'General-purpose',
    extensions: ['.rb'],
    editorMode: 'ruby',
    compiler: 'CRuby (YARV)',
    binary: 'ruby',
    versionArgs: ['--version'],
    capabilities: { compile: false, run: true, stdin: true, preview: false },
    starterCode: `puts "DistributedOS Ruby Script"`
  },
  {
    id: 'php',
    name: 'PHP',
    category: 'General-purpose',
    extensions: ['.php'],
    editorMode: 'php',
    compiler: 'PHP CLI Engine (Zend)',
    binary: 'php',
    versionArgs: ['--version'],
    capabilities: { compile: false, run: true, stdin: true, preview: false },
    starterCode: `<?php echo "DistributedOS PHP Runtime\\n"; ?>`
  },
  {
    id: 'csharp',
    name: 'C#',
    category: 'General-purpose',
    extensions: ['.cs'],
    editorMode: 'csharp',
    compiler: '.NET SDK / Roslyn',
    binary: 'dotnet',
    versionArgs: ['--version'],
    capabilities: { compile: true, run: true, stdin: true, preview: false },
    starterCode: `using System;\nclass Program { static void Main() { Console.WriteLine("C# Runtime"); } }`
  },
  {
    id: 'perl',
    name: 'Perl',
    category: 'General-purpose',
    extensions: ['.pl'],
    editorMode: 'perl',
    compiler: 'Perl 5 Interpreter',
    binary: 'perl',
    versionArgs: ['--version'],
    capabilities: { compile: false, run: true, stdin: true, preview: false },
    starterCode: `print "DistributedOS Perl Script\\n";`
  },
  {
    id: 'r',
    name: 'R',
    category: 'Scientific and numerical computing',
    extensions: ['.r', '.R'],
    editorMode: 'r',
    compiler: 'R Statistical Language',
    binary: 'Rscript',
    versionArgs: ['--version'],
    capabilities: { compile: false, run: true, stdin: false, preview: false },
    starterCode: `cat("DistributedOS R Analysis\\n")`
  },
  {
    id: 'julia',
    name: 'Julia',
    category: 'Scientific and numerical computing',
    extensions: ['.jl'],
    editorMode: 'julia',
    compiler: 'Julia Language Engine',
    binary: 'julia',
    versionArgs: ['--version'],
    capabilities: { compile: false, run: true, stdin: true, preview: false },
    starterCode: `println("DistributedOS Julia Scientific Computing")`
  },
  {
    id: 'scala',
    name: 'Scala',
    category: 'General-purpose',
    extensions: ['.scala'],
    editorMode: 'scala',
    compiler: 'Scala 3 Compiler (scalac)',
    binary: 'scalac',
    versionArgs: ['-version'],
    capabilities: { compile: true, run: true, stdin: true, preview: false },
    starterCode: `@main def run() = println("DistributedOS Scala Runtime")`
  },
  {
    id: 'dart',
    name: 'Dart',
    category: 'General-purpose',
    extensions: ['.dart'],
    editorMode: 'dart',
    compiler: 'Dart VM',
    binary: 'dart',
    versionArgs: ['--version'],
    capabilities: { compile: false, run: true, stdin: true, preview: false },
    starterCode: `void main() { print("DistributedOS Dart"); }`
  },
  {
    id: 'swift',
    name: 'Swift',
    category: 'General-purpose',
    extensions: ['.swift'],
    editorMode: 'swift',
    compiler: 'Swift Compiler (swiftc)',
    binary: 'swift',
    versionArgs: ['--version'],
    capabilities: { compile: true, run: true, stdin: true, preview: false },
    starterCode: `print("DistributedOS Swift Environment")`
  },
  {
    id: 'kotlin',
    name: 'Kotlin',
    category: 'General-purpose',
    extensions: ['.kt', '.kts'],
    editorMode: 'kotlin',
    compiler: 'Kotlin Compiler (kotlinc)',
    binary: 'kotlinc',
    versionArgs: ['-version'],
    capabilities: { compile: true, run: true, stdin: true, preview: false },
    starterCode: `fun main() { println("DistributedOS Kotlin Runner"); }`
  }
];
