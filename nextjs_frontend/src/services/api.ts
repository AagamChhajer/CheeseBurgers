const API_BASE_URL: string = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const API_URL: string = "http://localhost:5000";

type LogEntry = {
  user_id: string;
  timestamp?: string;
  key?: string;
  x?: number;
  y?: number;
  tabUrl?: string;
};

export const fetchLogs = async (): Promise<any[] | null> => {
  try {
    const response = await fetch(`${API_URL}/get_logs`);
    if (!response.ok) throw new Error("Failed to fetch logs");
    return await response.json();
  } catch (error) {
    console.error("Fetch Logs Error:", error);
    return null;
  }
};

export const logMouseMovement = async (data: { user_id: string; x: number; y: number }): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/log_mouse_movement`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, timestamp: new Date().toISOString() }),
    });
    if (!response.ok) throw new Error("Mouse movement log failed");
    return await response.json();
  } catch (error) {
    console.error("Mouse Movement Log Error:", error);
    return null;
  }
};

export const logTabSwitch = async (data: { user_id: string; tabUrl: string }): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/log_tab_switch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, timestamp: new Date().toISOString() }),
    });
    if (!response.ok) throw new Error("Tab switch log failed");
    return response.json();
  } catch (error) {
    console.error("Tab Switch Log Error:", error);
    return null;
  }
};

export const logKeystroke = async (data: { user_id: string; key: string }): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/log_keystroke`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: data.user_id,
        timestamp: new Date().toISOString(),
        key: data.key,
      }),
    });
    if (!response.ok) throw new Error("Keystroke log failed");
    return response.json();
  } catch (error) {
    console.error("Keystroke Log Error:", error);
    return null;
  }
};

export const signup = async (data: { username: string; email: string; password: string }): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/api/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Signup failed");
    return response.json();
  } catch (error) {
    console.error("Signup Error:", error);
    return null;
  }
};

export const login = async (data: { email: string; password: string }): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Login failed");
    return response.json();
  } catch (error) {
    console.error("Login Error:", error);
    return null;
  }
};
