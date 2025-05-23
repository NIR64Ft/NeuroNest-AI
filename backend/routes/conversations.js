/**
 * Conversation routes for NeuroNest AI
 * Handles conversation history with both Firebase and Supabase
 */

const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
const { verifyToken } = require('./auth');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Firebase references
const db = admin.firestore();
const conversationsRef = db.collection('conversations');

/**
 * Get all conversations for a user
 * @route GET /api/conversations
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid || req.user.id;
    
    // Check if using Supabase
    const useSupabase = process.env.USE_SUPABASE === 'true';
    
    if (useSupabase) {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      res.json({ conversations: data });
    } else {
      const snapshot = await conversationsRef
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
      
      const conversations = [];
      snapshot.forEach(doc => {
        conversations.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      res.json({ conversations });
    }
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

/**
 * Get a conversation by ID
 * @route GET /api/conversations/:id
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid || req.user.id;
    const conversationId = req.params.id;
    
    // Check if using Supabase
    const useSupabase = process.env.USE_SUPABASE === 'true';
    
    if (useSupabase) {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', userId)
        .single();
      
      if (error) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      
      res.json({ conversation: data });
    } else {
      const doc = await conversationsRef.doc(conversationId).get();
      
      if (!doc.exists || doc.data().userId !== userId) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      
      res.json({ conversation: { id: doc.id, ...doc.data() } });
    }
  } catch (error) {
    console.error('Error getting conversation:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
});

/**
 * Create a new conversation
 * @route POST /api/conversations
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid || req.user.id;
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    // Check if using Supabase
    const useSupabase = process.env.USE_SUPABASE === 'true';
    
    if (useSupabase) {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: userId,
          title,
          description,
          messages: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      res.status(201).json({ conversation: data });
    } else {
      const conversationData = {
        userId,
        title,
        description,
        messages: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      const docRef = await conversationsRef.add(conversationData);
      const doc = await docRef.get();
      
      res.status(201).json({ conversation: { id: doc.id, ...doc.data() } });
    }
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

/**
 * Update a conversation
 * @route PUT /api/conversations/:id
 */
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid || req.user.id;
    const conversationId = req.params.id;
    const { title, description } = req.body;
    
    // Check if using Supabase
    const useSupabase = process.env.USE_SUPABASE === 'true';
    
    if (useSupabase) {
      // First check if conversation exists and belongs to user
      const { data: existingConversation, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', userId)
        .single();
      
      if (fetchError || !existingConversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      
      // Update the conversation
      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      updateData.updated_at = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('conversations')
        .update(updateData)
        .eq('id', conversationId)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      res.json({ conversation: data });
    } else {
      // First check if conversation exists and belongs to user
      const doc = await conversationsRef.doc(conversationId).get();
      
      if (!doc.exists || doc.data().userId !== userId) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      
      // Update the conversation
      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
      
      await conversationsRef.doc(conversationId).update(updateData);
      
      const updatedDoc = await conversationsRef.doc(conversationId).get();
      
      res.json({ conversation: { id: updatedDoc.id, ...updatedDoc.data() } });
    }
  } catch (error) {
    console.error('Error updating conversation:', error);
    res.status(500).json({ error: 'Failed to update conversation' });
  }
});

/**
 * Delete a conversation
 * @route DELETE /api/conversations/:id
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid || req.user.id;
    const conversationId = req.params.id;
    
    // Check if using Supabase
    const useSupabase = process.env.USE_SUPABASE === 'true';
    
    if (useSupabase) {
      // First check if conversation exists and belongs to user
      const { data: existingConversation, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', userId)
        .single();
      
      if (fetchError || !existingConversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      
      // Delete the conversation
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId)
        .eq('user_id', userId);
      
      if (error) {
        throw error;
      }
      
      res.json({ success: true });
    } else {
      // First check if conversation exists and belongs to user
      const doc = await conversationsRef.doc(conversationId).get();
      
      if (!doc.exists || doc.data().userId !== userId) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      
      // Delete the conversation
      await conversationsRef.doc(conversationId).delete();
      
      res.json({ success: true });
    }
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

/**
 * Add a message to a conversation
 * @route POST /api/conversations/:id/messages
 */
router.post('/:id/messages', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid || req.user.id;
    const conversationId = req.params.id;
    const { content, role, metadata = {} } = req.body;
    
    if (!content || !role) {
      return res.status(400).json({ error: 'Content and role are required' });
    }
    
    // Check if using Supabase
    const useSupabase = process.env.USE_SUPABASE === 'true';
    
    if (useSupabase) {
      // First check if conversation exists and belongs to user
      const { data: existingConversation, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', userId)
        .single();
      
      if (fetchError || !existingConversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      
      // Add message to conversation
      const message = {
        id: uuidv4(),
        content,
        role,
        metadata,
        timestamp: new Date().toISOString()
      };
      
      const messages = [...existingConversation.messages, message];
      
      const { data, error } = await supabase
        .from('conversations')
        .update({
          messages,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      res.json({ message, conversation: data });
    } else {
      // First check if conversation exists and belongs to user
      const doc = await conversationsRef.doc(conversationId).get();
      
      if (!doc.exists || doc.data().userId !== userId) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      
      // Add message to conversation
      const message = {
        id: uuidv4(),
        content,
        role,
        metadata,
        timestamp: new Date().toISOString()
      };
      
      const conversationData = doc.data();
      const messages = [...conversationData.messages, message];
      
      await conversationsRef.doc(conversationId).update({
        messages,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      const updatedDoc = await conversationsRef.doc(conversationId).get();
      
      res.json({
        message,
        conversation: { id: updatedDoc.id, ...updatedDoc.data() }
      });
    }
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

/**
 * Delete a message from a conversation
 * @route DELETE /api/conversations/:id/messages/:messageId
 */
router.delete('/:id/messages/:messageId', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid || req.user.id;
    const conversationId = req.params.id;
    const messageId = req.params.messageId;
    
    // Check if using Supabase
    const useSupabase = process.env.USE_SUPABASE === 'true';
    
    if (useSupabase) {
      // First check if conversation exists and belongs to user
      const { data: existingConversation, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', userId)
        .single();
      
      if (fetchError || !existingConversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      
      // Remove message from conversation
      const messages = existingConversation.messages.filter(m => m.id !== messageId);
      
      if (messages.length === existingConversation.messages.length) {
        return res.status(404).json({ error: 'Message not found' });
      }
      
      const { data, error } = await supabase
        .from('conversations')
        .update({
          messages,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      res.json({ success: true, conversation: data });
    } else {
      // First check if conversation exists and belongs to user
      const doc = await conversationsRef.doc(conversationId).get();
      
      if (!doc.exists || doc.data().userId !== userId) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      
      // Remove message from conversation
      const conversationData = doc.data();
      const messages = conversationData.messages.filter(m => m.id !== messageId);
      
      if (messages.length === conversationData.messages.length) {
        return res.status(404).json({ error: 'Message not found' });
      }
      
      await conversationsRef.doc(conversationId).update({
        messages,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      const updatedDoc = await conversationsRef.doc(conversationId).get();
      
      res.json({
        success: true,
        conversation: { id: updatedDoc.id, ...updatedDoc.data() }
      });
    }
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

module.exports = router;