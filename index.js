const express = require('express');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const CORS = require('cors')
const serverless = require('serverless-http')

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use(CORS({origin:'*'}))

// Create a user
app.post('/users', async (req, res) => {
  const { name, email } = req.body;

  try {
    const newUser = await prisma.user.create({
      data: { name, email },
    });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Create many user
app.post('/addmany-users', async (req, res) => {
  const reqData = req.body;

  try {
    const newUser = await prisma.user.createMany({
      data:reqData
    });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users
app.get('/users', async (req, res) => {
  
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific user by ID
app.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { todos: true },  // Include related todos
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a user
app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { name, email },
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a user
app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await prisma.user.delete({
      where: { id },
    });
    res.status(200).json(deletedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a main todo for a user
app.post('/maintodos', async (req, res) => {
  const { userId, date, content, status, isSubToDoExists } = req.body;
  try {
    const newMainToDo = await prisma.mainToDo.create({
      data: {
        userId,
        date,
        content,
        status,
        isSubToDoExists,
      },
    });
    res.status(201).json(newMainToDo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all main todos for a user
app.get('/maintodos', async (req, res) => {
  try {
    const maintodos = await prisma.mainToDo.findMany({
      include: { subToDos: true },  // Include related subtodos
    });
    res.status(200).json(maintodos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a sub todo for a main todo
app.post('/subtodos', async (req, res) => {
  const { mainToDoId, date, content, status } = req.body;
  try {
    const newSubToDo = await prisma.subToDo.create({
      data: {
        mainToDoId,
        date,
        content,
        status,
      },
    });
    res.status(201).json(newSubToDo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all sub todos
app.get('/subtodos', async (req, res) => {
  try {
    const subtodos = await prisma.subToDo.findMany();
    res.status(200).json(subtodos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific sub todo by ID
app.get('/subtodos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const subTodo = await prisma.subToDo.findUnique({
      where: { id },
    });
    if (!subTodo) return res.status(404).json({ message: 'SubToDo not found' });
    res.status(200).json(subTodo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a sub todo
app.put('/subtodos/:id', async (req, res) => {
  const { id } = req.params;
  const { date, content, status } = req.body;
  try {
    const updatedSubToDo = await prisma.subToDo.update({
      where: { id },
      data: { date, content, status },
    });
    res.status(200).json(updatedSubToDo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a sub todo
app.delete('/subtodos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedSubToDo = await prisma.subToDo.delete({
      where: { id },
    });
    res.status(200).json(deletedSubToDo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the Express server
const port = process.env.PORT || 3000;
// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });

module.exports.handler = serverless(app)
