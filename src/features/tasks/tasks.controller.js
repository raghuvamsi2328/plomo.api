const { z } = require("zod");
const { createTask, listTasks } = require("./tasks.service");

const allowedStatuses = ["new", "review", "completed"];

const createTaskSchema = z.object({
  parentName: z.string().min(2).max(120),
  mobileNumber: z.string().min(8).max(20),
  kidName: z.string().min(1).max(120),
  taskType: z.string().min(2).max(50),
  taskTitle: z.string().min(2).max(200),
  taskDescription: z.string().min(2).max(2000),
  taskPoints: z.coerce.number().int().min(0),
  taskStatus: z.enum(allowedStatuses)
});

const listTasksSchema = z.object({
  parentName: z.string().min(2).max(120),
  mobileNumber: z.string().min(8).max(20),
  kidName: z.string().min(1).max(120)
});

async function createTaskHandler(req, res, next) {
  try {
    const parsed = createTaskSchema.parse(req.body);
    const task = await createTask({
      parentId: req.user.parentId,
      ...parsed
    });

    return res.status(201).json({
      success: true,
      message: "Task created",
      data: {
        taskId: task.task_id,
        taskType: task.task_type,
        taskTitle: task.task_title,
        taskDescription: task.task_description,
        taskPoints: task.task_points,
        taskStatus: task.task_status,
        createdAt: task.created_at
      }
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: error.issues.map((issue) => issue.message).join("; ")
      });
    }
    return next(error);
  }
}

async function listTasksHandler(req, res, next) {
  try {
    const parsed = listTasksSchema.parse(req.body);
    const tasks = await listTasks({
      parentId: req.user.parentId,
      ...parsed
    });

    return res.status(200).json({
      success: true,
      message: "Task list fetched",
      data: tasks.map((task) => ({
        taskId: task.task_id,
        taskType: task.task_type,
        taskTitle: task.task_title,
        taskDescription: task.task_description,
        taskPoints: task.task_points,
        taskStatus: task.task_status,
        kidName: task.kid_name,
        createdAt: task.created_at
      }))
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: error.issues.map((issue) => issue.message).join("; ")
      });
    }
    return next(error);
  }
}

module.exports = {
  createTaskHandler,
  listTasksHandler
};
