use std::process::Command;
use std::net::TcpListener;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn init_bench(name: String) -> Result<String, String> {
    println!("Running init_bench with name: {}", name);

    let mut child = Command::new("bash")
        .arg("init-bench.sh") // Just the script name since we're in the directory
        .arg(&name)
        .current_dir("shell-scripts") // Change to shell-scripts directory
        .spawn()
        .expect("failed to execute process");

    let status = child.wait().expect("failed to wait for process");

    if status.success() {
        Ok(format!("Project {} initialized successfully!", name))
    } else {
        Err(format!("Failed to initialize project: {:?}", status))
    }
}

#[tauri::command]
fn find_unused_ports(start_port: u16, number_of_ports: u16) -> Vec<u16> {
    let mut ports = Vec::new();
    let port = start_port;
    let mut count = 0;
    
   for port in port..65535 {
        if count == number_of_ports {
            break;
        }
        if is_port_available(port) {
            ports.push(port);
            count += 1;
        }
    }

    ports
}

/// Check if the local port is available.
///
/// ### Example
/// ```no_run
/// println!("Is port 80 available to use? {}", is_port_available(80));
/// ```
pub fn is_port_available(port: u16) -> bool {
    match TcpListener::bind(("0.0.0.0", port)) {
        Ok(_) => true,
        Err(_) => false,
    }
}

#[tauri::command]
fn open_folder_in_vscode(path: String) {
    Command::new("code")
        .arg(path)
        .spawn()
        .expect("failed to execute process");
}

#[tauri::command]
fn open_bench_terminal() {
    Command::new("gnome-terminal")
        .arg("--")
        .arg("bash")
        .arg("-c")
        .arg("cd shell-scripts && bash bench.sh")
        .spawn()
        .expect("failed to execute process");
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, init_bench, find_unused_ports, open_folder_in_vscode, open_bench_terminal])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
