import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Helper to get authenticated user
async function getAuthUser(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) return null;
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) return null;
  
  return user;
}

// Helper to generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Helper to get departments with descriptions
async function getDepartments() {
  const departments = await kv.get('departments') || [];
  return departments;
}

// Helper to classify grievance with Gemini AI
async function classifyGrievance(title: string, description: string) {
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY') || 'AIzaSyC8KSI0rReeJSXZUCH1KK5eJCEQ3Xo1ftA';
  
  // Get active departments
  const departments = await getDepartments();
  const departmentList = departments.map((d: any) => `${d.name}: ${d.description}`).join('\n');
  const departmentNames = departments.map((d: any) => d.name);
  
  const prompt = `You are an AI classifier for college grievances. Analyze the following grievance and classify it.

Title: ${title}
Description: ${description}

Available Departments:
${departmentList}

Classify into:
- department: choose the most appropriate department from [${departmentNames.join(', ')}]
- priority: one of [High, Medium, Low] based on urgency and severity
- reason: brief explanation of your classification

Return ONLY valid JSON with this exact structure:
{"department": "...", "priority": "...", "reason": "...", "confidence": 0.95}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 1,
            topP: 1,
            maxOutputTokens: 500,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Extract JSON from the response (sometimes it's wrapped in markdown code blocks)
    let jsonText = generatedText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    const classification = JSON.parse(jsonText);
    
    return {
      department: classification.department || 'Other',
      priority: classification.priority || 'Medium',
      reason: classification.reason || 'Auto-classified',
      confidence: classification.confidence || 0.8,
    };
  } catch (error) {
    console.log(`AI Classification error: ${error}. Using fallback classification.`);
    
    // Fallback classification based on keywords
    const departments = await getDepartments();
    let department = departments.length > 0 ? departments[0].name : 'General';
    let priority = 'Medium';
    
    const text = (title + ' ' + description).toLowerCase();
    
    // Match keywords to departments
    for (const dept of departments) {
      const keywords = dept.description.toLowerCase();
      if (
        text.includes(dept.name.toLowerCase()) ||
        (keywords.includes('fees') && (text.includes('fees') || text.includes('payment'))) ||
        (keywords.includes('account') && text.includes('account')) ||
        (keywords.includes('cleaning') && (text.includes('clean') || text.includes('dirty'))) ||
        (keywords.includes('security') && (text.includes('security') || text.includes('lost'))) ||
        (keywords.includes('camera') && text.includes('camera'))
      ) {
        department = dept.name;
        break;
      }
    }
    
    if (text.includes('urgent') || text.includes('emergency') || text.includes('immediately')) {
      priority = 'High';
    } else if (text.includes('minor') || text.includes('suggestion')) {
      priority = 'Low';
    }
    
    return {
      department,
      priority,
      reason: 'Fallback keyword-based classification',
      confidence: 0.6,
    };
  }
}

// POST /make-server-8fa157fc/signup - Register new user
app.post('/make-server-8fa157fc/signup', async (c) => {
  try {
    console.log('Signup request received');
    const body = await c.req.json();
    console.log('Signup data:', { email: body.email, hasName: !!body.name, hasPassword: !!body.password, role: body.role });
    
    const { name, email, password, role = 'student', department } = body;

    if (!name || !email || !password) {
      console.log('Missing required fields');
      return c.json({ error: 'Missing required fields: name, email, password' }, 400);
    }

    // Validate role
    const validRoles = ['student', 'teacher', 'hod', 'admin'];
    if (!validRoles.includes(role)) {
      console.log('Invalid role:', role);
      return c.json({ error: 'Invalid role selected' }, 400);
    }

    // If HOD, department is required
    if (role === 'hod' && !department) {
      console.log('Missing department for HOD role');
      return c.json({ error: 'Department is required for Head of Department role' }, 400);
    }

    console.log('Creating user with Supabase...');
    const userMetadata: any = { name, role };
    if (department) {
      userMetadata.department = department;
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: userMetadata,
      email_confirm: true, // Auto-confirm since no email server configured
    });

    if (error) {
      console.log(`Signup error from Supabase: ${error.message}`, error);
      return c.json({ error: error.message }, 400);
    }

    console.log('User created successfully:', data.user.id);
    return c.json({ 
      success: true, 
      user: { id: data.user.id, email: data.user.email, name } 
    });
  } catch (error) {
    console.log(`Signup processing error: ${error}`, error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// Helper to send email notification using Gmail SMTP
async function sendEmail(to: string, subject: string, body: string) {
  const gmailUser = Deno.env.get('GMAIL_USER');
  const gmailAppPassword = Deno.env.get('GMAIL_APP_PASSWORD');
  
  if (!gmailUser || !gmailAppPassword) {
    console.log(`Email notification (not sent - missing Gmail credentials): To: ${to}, Subject: ${subject}`);
    return;
  }
  
  try {
    // Import nodemailer
    const nodemailer = await import('npm:nodemailer@6.9.7');
    
    // Create transporter with Gmail SMTP
    const transporter = nodemailer.default.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Use STARTTLS
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });
    
    // Send email
    const info = await transporter.sendMail({
      from: `"AI Grievance System" <${gmailUser}>`,
      to: to,
      subject: subject,
      html: body,
    });
    
    console.log(`Email sent successfully to ${to}: ${info.messageId}`);
  } catch (error) {
    console.log(`Failed to send email to ${to}: ${error}`);
  }
}

// POST /make-server-8fa157fc/grievances - Submit new grievance
app.post('/make-server-8fa157fc/grievances', async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    const { title, description, isAnonymous, attachment, manualDepartment } = await c.req.json();

    if (!title || !description) {
      return c.json({ error: 'Title and description are required' }, 400);
    }

    let classification;
    let usedManualSelection = false;
    
    // If user manually selected a department, use it
    if (manualDepartment) {
      usedManualSelection = true;
      classification = {
        department: manualDepartment,
        priority: 'Medium', // Default priority for manual selection
        reason: 'Manually selected by user',
        confidence: 1.0,
      };
    } else {
      // Otherwise, classify with AI
      classification = await classifyGrievance(title, description);
    }

    const grievanceId = generateId();
    const grievance = {
      id: grievanceId,
      title,
      description,
      department: classification.department,
      priority: classification.priority,
      status: 'Pending',
      isAnonymous: isAnonymous || false,
      userId: user?.id || 'anonymous',
      userName: isAnonymous ? 'Anonymous' : (user?.user_metadata?.name || 'Unknown'),
      userEmail: isAnonymous ? null : user?.email,
      attachment: attachment || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
      manuallyClassified: usedManualSelection,
    };

    // Save grievance
    await kv.set(`grievance:${grievanceId}`, grievance);

    // Add to all grievances list
    const allGrievances = (await kv.get('all_grievances')) || [];
    allGrievances.unshift(grievanceId);
    await kv.set('all_grievances', allGrievances);

    // Add to user's grievances if not anonymous
    if (user && !isAnonymous) {
      const userGrievances = (await kv.get(`user_grievances:${user.id}`)) || [];
      userGrievances.unshift(grievanceId);
      await kv.set(`user_grievances:${user.id}`, userGrievances);
    }

    // Log AI classification (only if AI was used)
    if (!usedManualSelection) {
      const logId = generateId();
      await kv.set(`ai_log:${logId}`, {
        grievanceId,
        classification,
        timestamp: new Date().toISOString(),
      });
    }

    // Send email notification to user (if not anonymous)
    if (user?.email && !isAnonymous) {
      await sendEmail(
        user.email,
        'Grievance Submitted Successfully',
        `
          <h2>Your grievance has been submitted</h2>
          <p><strong>Title:</strong> ${title}</p>
          <p><strong>Department:</strong> ${classification.department}</p>
          <p><strong>Priority:</strong> ${classification.priority}</p>
          <p><strong>Status:</strong> Pending</p>
          <p>You will be notified when there are updates to your grievance.</p>
        `
      );
    }

    // Send notification to department HOD/admin
    // Get users with admin or hod role for this department
    const { data: allUsers } = await supabase.auth.admin.listUsers();
    const departmentRecipients = allUsers?.users.filter(u => 
      (u.user_metadata?.role === 'admin') || 
      (u.user_metadata?.role === 'hod' && u.user_metadata?.department === classification.department)
    ) || [];

    for (const recipient of departmentRecipients) {
      if (recipient.email) {
        await sendEmail(
          recipient.email,
          'New Grievance Received',
          `
            <h2>New grievance has been submitted</h2>
            <p><strong>Title:</strong> ${title}</p>
            <p><strong>Department:</strong> ${classification.department}</p>
            <p><strong>Priority:</strong> ${classification.priority}</p>
            <p><strong>Submitted by:</strong> ${grievance.userName}</p>
            <p>Please log in to the system to review and respond.</p>
          `
        );
      }
    }

    return c.json({ 
      success: true, 
      grievance,
      classification 
    });
  } catch (error) {
    console.log(`Submit grievance error: ${error}`);
    return c.json({ error: 'Failed to submit grievance' }, 500);
  }
});

// GET /make-server-8fa157fc/grievances - List grievances with filters
app.get('/make-server-8fa157fc/grievances', async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    const isAdmin = user?.user_metadata?.role === 'admin';
    const isHOD = user?.user_metadata?.role === 'hod';
    const userDepartment = user?.user_metadata?.department;
    const userOnly = c.req.query('userOnly') === 'true';
    const priority = c.req.query('priority');
    const status = c.req.query('status');
    const department = c.req.query('department');

    let grievanceIds: string[] = [];

    if (userOnly && user) {
      grievanceIds = (await kv.get(`user_grievances:${user.id}`)) || [];
    } else {
      grievanceIds = (await kv.get('all_grievances')) || [];
    }

    // Fetch all grievances
    const grievances = await Promise.all(
      grievanceIds.map(async (id) => await kv.get(`grievance:${id}`))
    );

    // Filter out nulls and apply filters
    let filtered = grievances.filter((g) => g !== null);

    // HODs can only see grievances from their department
    if (isHOD && userDepartment) {
      filtered = filtered.filter((g) => g.department === userDepartment);
    }

    if (priority && priority !== 'All') {
      filtered = filtered.filter((g) => g.priority === priority);
    }

    if (status && status !== 'All') {
      filtered = filtered.filter((g) => g.status === status);
    }

    if (department && department !== 'All') {
      filtered = filtered.filter((g) => g.department === department);
    }

    // Hide email for non-admins viewing anonymous grievances
    if (!isAdmin && !isHOD) {
      filtered = filtered.map(g => {
        if (g.isAnonymous) {
          return { ...g, userEmail: null, userId: 'anonymous' };
        }
        return g;
      });
    }

    return c.json({ grievances: filtered });
  } catch (error) {
    console.log(`List grievances error: ${error}`);
    return c.json({ error: 'Failed to fetch grievances' }, 500);
  }
});

// GET /make-server-8fa157fc/grievances/:id - Get single grievance
app.get('/make-server-8fa157fc/grievances/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const grievance = await kv.get(`grievance:${id}`);

    if (!grievance) {
      return c.json({ error: 'Grievance not found' }, 404);
    }

    return c.json({ grievance });
  } catch (error) {
    console.log(`Get grievance error: ${error}`);
    return c.json({ error: 'Failed to fetch grievance' }, 500);
  }
});

// PUT /make-server-8fa157fc/grievances/:id/status - Update status (admin/HOD only)
app.put('/make-server-8fa157fc/grievances/:id/status', async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    const isAdmin = user?.user_metadata?.role === 'admin';
    const isHOD = user?.user_metadata?.role === 'hod';
    
    if (!user || (!isAdmin && !isHOD)) {
      return c.json({ error: 'Unauthorized. Admin or HOD access required.' }, 401);
    }

    const id = c.req.param('id');
    const { status } = await c.req.json();

    if (!['Pending', 'In Progress', 'Resolved', 'Rejected'].includes(status)) {
      return c.json({ error: 'Invalid status' }, 400);
    }

    const grievance = await kv.get(`grievance:${id}`);
    if (!grievance) {
      return c.json({ error: 'Grievance not found' }, 404);
    }

    const oldStatus = grievance.status;
    grievance.status = status;
    grievance.updatedAt = new Date().toISOString();

    await kv.set(`grievance:${id}`, grievance);

    // Send email notification to user about status change
    if (grievance.userEmail && !grievance.isAnonymous) {
      await sendEmail(
        grievance.userEmail,
        `Grievance Status Updated: ${status}`,
        `
          <h2>Your grievance status has been updated</h2>
          <p><strong>Title:</strong> ${grievance.title}</p>
          <p><strong>Previous Status:</strong> ${oldStatus}</p>
          <p><strong>New Status:</strong> ${status}</p>
          <p><strong>Department:</strong> ${grievance.department}</p>
          <p>Log in to view more details and any comments from the department.</p>
        `
      );
    }

    return c.json({ success: true, grievance });
  } catch (error) {
    console.log(`Update status error: ${error}`);
    return c.json({ error: 'Failed to update status' }, 500);
  }
});

// POST /make-server-8fa157fc/grievances/:id/comment - Add comment
app.post('/make-server-8fa157fc/grievances/:id/comment', async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    
    if (!user) {
      return c.json({ error: 'Unauthorized. Please login.' }, 401);
    }

    const id = c.req.param('id');
    const { comment } = await c.req.json();

    if (!comment) {
      return c.json({ error: 'Comment text is required' }, 400);
    }

    const grievance = await kv.get(`grievance:${id}`);
    if (!grievance) {
      return c.json({ error: 'Grievance not found' }, 404);
    }

    const isAdminOrHOD = user.user_metadata?.role === 'admin' || user.user_metadata?.role === 'hod';
    
    const newComment = {
      id: generateId(),
      text: comment,
      userId: user.id,
      userName: user.user_metadata?.name || 'User',
      userRole: user.user_metadata?.role || 'student',
      isAdmin: user.user_metadata?.role === 'admin',
      createdAt: new Date().toISOString(),
    };

    grievance.comments = grievance.comments || [];
    grievance.comments.push(newComment);
    grievance.updatedAt = new Date().toISOString();

    await kv.set(`grievance:${id}`, grievance);

    // Send email notification to the grievance submitter (if comment is from admin/HOD)
    if (isAdminOrHOD && grievance.userEmail && !grievance.isAnonymous) {
      await sendEmail(
        grievance.userEmail,
        'New Comment on Your Grievance',
        `
          <h2>A new comment has been added to your grievance</h2>
          <p><strong>Grievance Title:</strong> ${grievance.title}</p>
          <p><strong>Comment from:</strong> ${newComment.userName} (${user.user_metadata?.role})</p>
          <p><strong>Comment:</strong> ${comment}</p>
          <p>Log in to view the full conversation and respond.</p>
        `
      );
    }

    return c.json({ success: true, comment: newComment });
  } catch (error) {
    console.log(`Add comment error: ${error}`);
    return c.json({ error: 'Failed to add comment' }, 500);
  }
});

// GET /make-server-8fa157fc/stats - Get dashboard statistics
app.get('/make-server-8fa157fc/stats', async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    const isAdmin = user?.user_metadata?.role === 'admin';
    const isHOD = user?.user_metadata?.role === 'hod';
    
    if (!user || (!isAdmin && !isHOD)) {
      return c.json({ error: 'Unauthorized. Admin or HOD access required.' }, 401);
    }

    const grievanceIds = (await kv.get('all_grievances')) || [];
    const grievances = await Promise.all(
      grievanceIds.map(async (id) => await kv.get(`grievance:${id}`))
    );

    let validGrievances = grievances.filter((g) => g !== null);

    // Filter by department for HODs
    if (isHOD && user.user_metadata?.department) {
      validGrievances = validGrievances.filter((g) => g.department === user.user_metadata.department);
    }

    const stats = {
      total: validGrievances.length,
      highPriority: validGrievances.filter((g) => g.priority === 'High').length,
      mediumPriority: validGrievances.filter((g) => g.priority === 'Medium').length,
      lowPriority: validGrievances.filter((g) => g.priority === 'Low').length,
      pending: validGrievances.filter((g) => g.status === 'Pending').length,
      inProgress: validGrievances.filter((g) => g.status === 'In Progress').length,
      resolved: validGrievances.filter((g) => g.status === 'Resolved').length,
      rejected: validGrievances.filter((g) => g.status === 'Rejected').length,
      byDepartment: {},
    };

    // Count by department
    validGrievances.forEach((g) => {
      stats.byDepartment[g.department] = (stats.byDepartment[g.department] || 0) + 1;
    });

    return c.json({ stats });
  } catch (error) {
    console.log(`Get stats error: ${error}`);
    return c.json({ error: 'Failed to fetch statistics' }, 500);
  }
});

// GET /make-server-8fa157fc/ai/logs - Get AI classification logs
app.get('/make-server-8fa157fc/ai/logs', async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    const isAdmin = user?.user_metadata?.role === 'admin';
    const isHOD = user?.user_metadata?.role === 'hod';
    
    if (!user || (!isAdmin && !isHOD)) {
      return c.json({ error: 'Unauthorized. Admin or HOD access required.' }, 401);
    }

    const logKeys = await kv.getByPrefix('ai_log:');
    let logs = logKeys.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, 50); // Return last 50 logs

    // Filter by department for HODs
    if (isHOD && user.user_metadata?.department) {
      logs = logs.filter((log) => log.classification?.department === user.user_metadata.department);
    }

    return c.json({ logs });
  } catch (error) {
    console.log(`Get AI logs error: ${error}`);
    return c.json({ error: 'Failed to fetch AI logs' }, 500);
  }
});

// GET /make-server-8fa157fc/departments - Get all departments
app.get('/make-server-8fa157fc/departments', async (c) => {
  try {
    const departments = await kv.get('departments') || [];
    return c.json({ departments });
  } catch (error) {
    console.log(`Get departments error: ${error}`);
    return c.json({ error: 'Failed to fetch departments' }, 500);
  }
});

// POST /make-server-8fa157fc/departments - Create department (admin only)
app.post('/make-server-8fa157fc/departments', async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    
    if (!user || user.user_metadata?.role !== 'admin') {
      return c.json({ error: 'Unauthorized. Admin access required.' }, 401);
    }

    const { name, description } = await c.req.json();

    if (!name || !description) {
      return c.json({ error: 'Name and description are required' }, 400);
    }

    const departments = await kv.get('departments') || [];
    
    // Check for duplicates
    if (departments.some((d: any) => d.name === name)) {
      return c.json({ error: 'Department already exists' }, 400);
    }

    const newDepartment = {
      id: generateId(),
      name,
      description,
      createdAt: new Date().toISOString(),
    };

    departments.push(newDepartment);
    await kv.set('departments', departments);

    return c.json({ success: true, department: newDepartment });
  } catch (error) {
    console.log(`Create department error: ${error}`);
    return c.json({ error: 'Failed to create department' }, 500);
  }
});

// PUT /make-server-8fa157fc/departments/:id - Update department (admin only)
app.put('/make-server-8fa157fc/departments/:id', async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    
    if (!user || user.user_metadata?.role !== 'admin') {
      return c.json({ error: 'Unauthorized. Admin access required.' }, 401);
    }

    const id = c.req.param('id');
    const { name, description } = await c.req.json();

    if (!name || !description) {
      return c.json({ error: 'Name and description are required' }, 400);
    }

    const departments = await kv.get('departments') || [];
    const index = departments.findIndex((d: any) => d.id === id);

    if (index === -1) {
      return c.json({ error: 'Department not found' }, 404);
    }

    departments[index] = {
      ...departments[index],
      name,
      description,
      updatedAt: new Date().toISOString(),
    };

    await kv.set('departments', departments);

    return c.json({ success: true, department: departments[index] });
  } catch (error) {
    console.log(`Update department error: ${error}`);
    return c.json({ error: 'Failed to update department' }, 500);
  }
});

// DELETE /make-server-8fa157fc/departments/:id - Delete department (admin only)
app.delete('/make-server-8fa157fc/departments/:id', async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    
    if (!user || user.user_metadata?.role !== 'admin') {
      return c.json({ error: 'Unauthorized. Admin access required.' }, 401);
    }

    const id = c.req.param('id');
    const departments = await kv.get('departments') || [];
    const filtered = departments.filter((d: any) => d.id !== id);

    if (filtered.length === departments.length) {
      return c.json({ error: 'Department not found' }, 404);
    }

    await kv.set('departments', filtered);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Delete department error: ${error}`);
    return c.json({ error: 'Failed to delete department' }, 500);
  }
});

// GET /make-server-8fa157fc/users - Get all users (admin only)
app.get('/make-server-8fa157fc/users', async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    
    if (!user || user.user_metadata?.role !== 'admin') {
      return c.json({ error: 'Unauthorized. Admin access required.' }, 401);
    }

    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.log(`List users error: ${error.message}`);
      return c.json({ error: 'Failed to fetch users' }, 500);
    }

    const users = data.users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.user_metadata?.name || 'Unknown',
      role: u.user_metadata?.role || 'student',
      department: u.user_metadata?.department,
      createdAt: u.created_at,
    }));

    return c.json({ users });
  } catch (error) {
    console.log(`Get users error: ${error}`);
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

// DELETE /make-server-8fa157fc/users/:id - Delete user (admin only)
app.delete('/make-server-8fa157fc/users/:id', async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    
    if (!user || user.user_metadata?.role !== 'admin') {
      return c.json({ error: 'Unauthorized. Admin access required.' }, 401);
    }

    const userId = c.req.param('id');

    // Prevent admin from deleting themselves
    if (userId === user.id) {
      return c.json({ error: 'Cannot delete your own account' }, 400);
    }

    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      console.log(`Delete user error: ${error.message}`);
      return c.json({ error: 'Failed to delete user' }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.log(`Delete user error: ${error}`);
    return c.json({ error: 'Failed to delete user' }, 500);
  }
});

// GET /make-server-8fa157fc/user-stats - Get user-specific statistics
app.get('/make-server-8fa157fc/user-stats', async (c) => {
  try {
    const user = await getAuthUser(c.req.raw);
    
    if (!user) {
      return c.json({ error: 'Unauthorized. Please login.' }, 401);
    }

    const grievanceIds = (await kv.get(`user_grievances:${user.id}`)) || [];
    const grievances = await Promise.all(
      grievanceIds.map(async (id) => await kv.get(`grievance:${id}`))
    );

    const validGrievances = grievances.filter((g) => g !== null);

    const stats = {
      total: validGrievances.length,
      pending: validGrievances.filter((g) => g.status === 'Pending').length,
      inProgress: validGrievances.filter((g) => g.status === 'In Progress').length,
      resolved: validGrievances.filter((g) => g.status === 'Resolved').length,
      rejected: validGrievances.filter((g) => g.status === 'Rejected').length,
    };

    return c.json({ stats });
  } catch (error) {
    console.log(`Get user stats error: ${error}`);
    return c.json({ error: 'Failed to fetch user statistics' }, 500);
  }
});

// Initialize default departments if none exist
async function initializeDefaultDepartments() {
  const existing = await kv.get('departments');
  if (!existing || existing.length === 0) {
    const defaultDepartments = [
      {
        id: generateId(),
        name: 'Accounts',
        description: 'Handles all fee payments, financial documents, scholarships, refunds, and student billing matters',
        createdAt: new Date().toISOString(),
      },
      {
        id: generateId(),
        name: 'IT Section',
        description: 'Manages student and faculty accounts, WiFi access, computer labs, software issues, and technical support',
        createdAt: new Date().toISOString(),
      },
      {
        id: generateId(),
        name: 'Housekeeping',
        description: 'Responsible for cleaning and maintenance of classrooms, labs, corridors, restrooms, and all college premises',
        createdAt: new Date().toISOString(),
      },
      {
        id: generateId(),
        name: 'Security',
        description: 'Handles lost and found items, security cameras, access control, campus safety, and security concerns',
        createdAt: new Date().toISOString(),
      },
    ];
    await kv.set('departments', defaultDepartments);
    console.log('Default departments initialized');
  }
}

// Initialize departments on startup
initializeDefaultDepartments().catch(console.error);

// Health check
app.get('/make-server-8fa157fc/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

Deno.serve(app.fetch);
