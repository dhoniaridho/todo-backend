import type { NextFunction, Request, Response } from 'express'
import { response } from '../../helpers/response'
import { mapError } from '../../helpers/validation'
import { TodoRepository } from './todo.repository'
import { schema, schemaUpdate } from './todo.schema'

export class TodoController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    const todoRepository = new TodoRepository()
    const query = req?.query?.activity_group_id
    const data = await todoRepository.getAll(query ? +query : null)
    return response(req, res).json(data)
  }

  async createOne(req: Request, res: Response) {
    const todoRepository = new TodoRepository()

    try {
      const value = await schema.validateAsync(req.body)
      const data = await todoRepository.createOne(value)

      if (!value.title)
        return response(req, res).json(
          null,
          'Bad Request',
          'title cannot be null',
          400
        )
      if (!value.activity_group_id)
        return response(req, res).json(
          null,
          'Bad Request',
          'activity_group_id cannot be null',
          400
        )

      return response(req, res).json(data, 'Success', 'Success', 201)
    } catch (error: any) {
      if (error) {
        return response(req, res).json(
          mapError(error.message),
          'Bad Request',
          'You provided invalid data'
        )
      }
    }
  }
  async update(req: Request, res: Response) {
    const todoRepository = new TodoRepository()
    const { value, error } = schemaUpdate.validate(req.body)

    // validate any errors
    if (error) {
      return response(req, res).json(
        mapError(error.message),
        'Bad Request',
        'Bad Request',
        400
      )
    }

    const data = await todoRepository.getOne(+req.params.id)

    const update = await todoRepository.updateOne(+req.params.id, value)

    // Handle 404
    if (!data)
      return response(req, res).json(
        {},
        'Not Found',
        `Todo with ID ${+req.params.id} Not Found`,
        404
      )

    return response(req, res).json(update, 'Success')
  }

  async getOne(req: Request, res: Response) {
    const todoRepository = new TodoRepository()
    const data = await todoRepository.getOne(+req.params.id)

    // Handle 404
    if (!data)
      return response(req, res).json(
        {},
        'Not Found',
        `Todo with ID ${+req.params.id} Not Found`,
        404
      )

    return response(req, res).json(data)
  }

  async deleteOne(req: Request, res: Response) {
    const todoRepository = new TodoRepository()
    const data = await todoRepository.deleteOne(+req.params.id)

    // Handle 404
    if (!data) {
      return response(req, res).json(
        {},
        'Not Found',
        `Todo with ID ${+req.params.id} Not Found`,
        404
      )
    }

    return response(req, res).json(
      {},
      'Success',
      `Data with id ID ${+req.params.id} was deleted`
    )
  }
}
