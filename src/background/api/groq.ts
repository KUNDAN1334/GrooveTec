import { StorageHelper } from './storage';
import { API_ENDPOINTS, GROQ_MODELS } from '../../shared/constants';
import { logger } from '../../shared/utils/logger';
import { QualityCheckResult } from '../../shared/types';

export class GroqAPI {
  private apiKey: string | null = null;
  
  constructor() {
    this.loadAPIKey();
  }
  
  // Load API key from storage
  async loadAPIKey() {
    this.apiKey = await StorageHelper.get('groqApiKey');
    if (!this.apiKey) {
      logger.warn('Groq API key not found in storage');
    }
  }
  
  // Generic Groq API request
  private async request(messages: any[], model: string = GROQ_MODELS.FAST) {
    if (!this.apiKey) {
      await this.loadAPIKey();
      if (!this.apiKey) {
        throw new Error('Groq API key not configured. Please add it in settings.');
      }
    }
    
    logger.log('🤖 Calling Groq API with model:', model);
    
    const response = await fetch(API_ENDPOINTS.GROQ_CHAT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
        max_tokens: 1024
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      logger.error('Groq API error:', error);
      throw new Error(`Groq API error: ${error.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    logger.success('Groq API response received');
    return data.choices[0].message.content;
  }
  
  // Check reply quality
  async checkQuality(replyText: string): Promise<QualityCheckResult> {
    const prompt = `Analyze this customer support reply and provide feedback in JSON format.

Reply: "${replyText}"

Check for:
1. Clarity (is it easy to understand?)
2. Completeness (does it answer the question?)
3. Empathy (does it show understanding?)
4. Grammar and spelling
5. Professional tone

Return ONLY valid JSON in this exact format:
{
  "score": 85,
  "issues": ["Issue 1", "Issue 2"],
  "suggestions": ["Suggestion 1", "Suggestion 2"]
}

Score should be 0-100. If no issues, return empty arrays.`;

    const messages = [
      {
        role: 'system',
        content: 'You are a customer support quality analyst. Return only valid JSON.'
      },
      {
        role: 'user',
        content: prompt
      }
    ];
    
    try {
      const response = await this.request(messages, GROQ_MODELS.FAST);
      
      // Parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return result;
      }
      
      // Fallback if parsing fails
      return {
        score: 75,
        issues: [],
        suggestions: ['Could not analyze reply completely']
      };
      
    } catch (error) {
      logger.error('Quality check failed:', error);
      throw error;
    }
  }
  
  // Generate AI reply suggestion
  async generateSuggestion(
    ticketSubject: string, 
    customerMessage: string,
    agentStyle: string = 'professional and friendly'
  ): Promise<string> {
    const prompt = `Generate a helpful customer support reply.

Ticket Subject: ${ticketSubject}
Customer Message: ${customerMessage}
Writing Style: ${agentStyle}

Write a clear, empathetic response that:
- Addresses the customer's concern directly
- Provides helpful information or next steps
- Maintains a ${agentStyle} tone
- Is concise (2-4 sentences)

Reply:`;

    const messages = [
      {
        role: 'system',
        content: 'You are a helpful customer support agent. Write clear, empathetic responses.'
      },
      {
        role: 'user',
        content: prompt
      }
    ];
    
    try {
      const response = await this.request(messages, GROQ_MODELS.BALANCED);
      return response.trim();
    } catch (error) {
      logger.error('Suggestion generation failed:', error);
      throw error;
    }
  }
}
