import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Task } from './tasks.interface';

@Injectable()
export class TasksRepository {
  private tasks: Task[] = [];

  create(userId: string, data: Partial<Task>): Task {
    const task: Task = {
      id: randomUUID(),
      title: data.title!,
      description: data.description,
      completed: false,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.tasks.push(task);
    return task;
  }

  findAllByUser(userId: string): Task[] {
    return this.tasks.filter((t) => t.userId === userId);
  }

  findByIdAndUser(taskId: string, userId: string): Task | undefined {
    return this.tasks.find((t) => t.id === taskId && t.userId === userId);
  }

  update(taskId: string, updates: Partial<Task>): Task {
    const task = this.tasks.find((t) => t.id === taskId)!;
    Object.assign(task, updates, { updatedAt: new Date() });
    return task;
  }

  delete(taskId: string): void {
    this.tasks = this.tasks.filter((t) => t.id !== taskId);
  }
}
