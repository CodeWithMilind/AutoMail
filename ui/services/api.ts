const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = {
    async fetchEmails(limit = 25) {
        const response = await fetch(`${API_BASE_URL}/gmail/emails?limit=${limit}`);
        if (!response.ok) throw new Error("Failed to fetch emails");
        return response.json();
    },

    async fetchEmailDetail(emailId: string) {
        const response = await fetch(`${API_BASE_URL}/gmail/emails/${emailId}`);
        if (!response.ok) throw new Error("Failed to fetch email detail");
        return response.json();
    },

    async analyzeEmail(emailId: string) {
        const response = await fetch(`${API_BASE_URL}/ai/analyze-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email_id: emailId }),
        });
        if (!response.ok) throw new Error("Failed to analyze email");
        return response.json();
    },

    async generateReply(emailId: string) {
        const response = await fetch(`${API_BASE_URL}/ai/generate-reply`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email_id: emailId }),
        });
        if (!response.ok) throw new Error("Failed to generate reply");
        return response.json();
    },

    async fetchTasks() {
        const response = await fetch(`${API_BASE_URL}/tasks`);
        if (!response.ok) throw new Error("Failed to fetch tasks");
        return response.json();
    },

    async fetchMeetings() {
        const response = await fetch(`${API_BASE_URL}/meetings`);
        if (!response.ok) throw new Error("Failed to fetch meetings");
        return response.json();
    },
};
