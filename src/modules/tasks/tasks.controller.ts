import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}
  private getUserId(req: any): string {
    return req.user?.email;
  }
  @Get()
  getTasks(@Req() req: Request) {
    const userId = this.getUserId(req);
    return this.tasksService.findAll(userId);
  }
  @Post()
  createTask(@Req() req: Request, @Body() dto: CreateTaskDto) {
    const userId = this.getUserId(req);
    return this.tasksService.create(userId, dto);
  }
  @Put(':id')
  updateTask(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    const userId = this.getUserId(req);
    return this.tasksService.update(userId, id, dto);
  }
  @Delete(':id')
  deleteTask(@Req() req: Request, @Param('id') id: string) {
    const userId = this.getUserId(req);
    return this.tasksService.remove(userId, id);
  }
}
