export class GrooveAPI {
    private apiKey = '02371a90784f71b3f5cd59dfc5c34d97fbd9dd3337a26174a4a...';
    private baseURL = 'https://api.groovehq.com/v1';
    

    
    async getTicket(ticketId: string) {
      const response = await fetch(
        `${this.baseURL}/tickets/${ticketId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.json();
    }
  }
  