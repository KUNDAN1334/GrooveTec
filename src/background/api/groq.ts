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
    
    logger.log('Calling Groq API with model:', model);
    
    const response = await fetch(API_ENDPOINTS.GROQ_CHAT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7, // INCREASED from 0.3 for more variety
        max_tokens: 1024,
        top_p: 0.9
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
        content: 'You are a customer support quality analyst. Return only valid JSON with no extra text.'
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
  
  // Generate AI reply suggestion - NOW WITH FULL CONTEXT!
  async generateSuggestion(
    subject: string,
    message: string,
    customerName?: string,
    customerEmail?: string,
    category?: string,
    priority?: string,
    style: string = 'professional and friendly'
  ): Promise<string> {
    // Build context-rich prompt
    const contextInfo = `
CUSTOMER: ${customerName || 'Customer'}
PRIORITY: ${priority || 'Normal'}
CATEGORY: ${category || 'General Support'}
SUBJECT: ${subject}
ISSUE: ${message}`;

    const prompt = `You are an expert customer support representative. Write a personalized response to this customer support ticket.

${contextInfo}

REQUIREMENTS:
1. Address the customer by their name (${customerName || 'Customer'})
2. Acknowledge THEIR SPECIFIC ISSUE, not a generic problem
3. Show empathy and understanding
4. Provide clear, actionable next steps
5. Maintain a ${style} tone
6. Keep it concise (2-4 sentences)
7. NO generic templates or placeholders
8. NO "Dear valued customer" - be personal!
9. Reference specific details from their issue

WRITE ONLY THE RESPONSE, NO INTRODUCTION:`;

    const messages = [
      {
        role: 'system',
        content: `You are a professional customer support agent. Create unique, personalized responses tailored to the specific customer issue. Never use generic templates. Always reference the customer's specific problem and provide relevant solutions.`
      },
      {
        role: 'user',
        content: prompt
      }
    ];
    
    try {
      logger.log('Generating contextual suggestion with full details...');
      const response = await this.request(messages, GROQ_MODELS.BALANCED);
      
      if (!response || response.trim().length === 0) {
        throw new Error('Empty response from Groq API');
      }
      
      logger.success('Unique suggestion generated');
      return response.trim();
      
    } catch (error) {
      logger.error('Suggestion generation failed:', error);
      throw error;
    }
  }
}
