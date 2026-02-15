import { Injectable, NotFoundException } from '@nestjs/common';
import { TasksRepository } from './tasks.repository';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private tasksRepo: TasksRepository) {}

  create(userId: string, dto: CreateTaskDto) {
    return this.tasksRepo.create(userId, dto);
  }

  findAll(userId: string) {
    return this.tasksRepo.findAllByUser(userId);
  }

  update(userId: string, taskId: string, dto: UpdateTaskDto) {
    const task = this.tasksRepo.findByIdAndUser(taskId, userId);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.tasksRepo.update(taskId, dto);
  }

  remove(userId: string, taskId: string) {
    const task = this.tasksRepo.findByIdAndUser(taskId, userId);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    this.tasksRepo.delete(taskId);
    return { message: 'Task deleted' };
  }
}
