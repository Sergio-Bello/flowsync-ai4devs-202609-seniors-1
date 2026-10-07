import Task from '#models/task'
import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Lo que cada tarea muestra de su responsable. Cubre el requisito «Lo que cada
 * tarea muestra de su responsable» de `openspec/specs/tasks/spec.md`. El
 * scenario de no filtrar datos de cuenta se comprueba tanto en la tarea suelta
 * como en la lista, porque el scenario pide ambas.
 */
test.group('Tasks | responsable', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  async function sesion(client: any, email = 'ada@example.com') {
    const response = await client.post('/api/v1/auth/login').json({ email, password: 'secreto123' })

    return response.body().data.token as string
  }

  async function cuenta(fullName: string | null = 'Ada Lovelace', email = 'ada@example.com') {
    return User.create({ fullName, email, password: 'secreto123' })
  }

  async function tareaSuelta(client: any, id: number, token: string) {
    return client
      .get(`/api/v1/tasks/${id}`)
      .qs({ today: '2026-10-06' })
      .header('Authorization', `Bearer ${token}`)
  }

  async function lista(client: any, token: string) {
    return client.get('/api/v1/tasks').header('Authorization', `Bearer ${token}`)
  }

  test('la tarea suelta trae el nombre y las iniciales de su responsable', async ({
    client,
    assert,
  }) => {
    const ada = await cuenta()
    const tarea = await Task.create({
      title: 'Escribir el motor',
      status: 'pending',
      assigneeId: ada.id,
    })
    const token = await sesion(client)

    const response = await tareaSuelta(client, tarea.id, token)

    response.assertStatus(200)
    const assignee = response.body().data.assignee
    assert.equal(assignee.fullName, 'Ada Lovelace')
    assert.equal(assignee.initials, 'AL')
  })

  test('la lista trae el nombre y las iniciales del responsable de cada tarea', async ({
    client,
    assert,
  }) => {
    const ada = await cuenta()
    await Task.create({ title: 'Escribir el motor', status: 'pending', assigneeId: ada.id })
    const token = await sesion(client)

    const response = await lista(client, token)

    response.assertStatus(200)
    const assignee = response.body().data[0].assignee
    assert.equal(assignee.fullName, 'Ada Lovelace')
    assert.equal(assignee.initials, 'AL')
  })

  test('la tarea suelta no expone el email ni otros datos de la cuenta', async ({
    client,
    assert,
  }) => {
    const ada = await cuenta()
    const tarea = await Task.create({
      title: 'Escribir el motor',
      status: 'pending',
      assigneeId: ada.id,
    })
    const token = await sesion(client)

    const response = await tareaSuelta(client, tarea.id, token)

    response.assertStatus(200)
    const assignee = response.body().data.assignee
    assert.notProperty(assignee, 'email')
    assert.notProperty(assignee, 'password')
    assert.notProperty(assignee, 'createdAt')
    assert.notProperty(assignee, 'updatedAt')
    assert.notInclude(JSON.stringify(response.body()), 'ada@example.com')
  })

  test('la lista no expone el email ni otros datos de la cuenta', async ({ client, assert }) => {
    const ada = await cuenta()
    const alan = await cuenta('Alan Turing', 'alan@example.com')
    await Task.create({ title: 'Escribir el motor', status: 'pending', assigneeId: ada.id })
    await Task.create({ title: 'Descifrar el mensaje', status: 'in_progress', assigneeId: alan.id })
    const token = await sesion(client)

    const response = await lista(client, token)

    response.assertStatus(200)
    const tareas = response.body().data
    assert.lengthOf(tareas, 2)
    for (const tarea of tareas) {
      assert.notProperty(tarea.assignee, 'email')
      assert.notProperty(tarea.assignee, 'password')
      assert.notProperty(tarea.assignee, 'createdAt')
      assert.notProperty(tarea.assignee, 'updatedAt')
    }
    const cuerpo = JSON.stringify(response.body())
    assert.notInclude(cuerpo, 'ada@example.com')
    assert.notInclude(cuerpo, 'alan@example.com')
  })

  test('un responsable sin nombre llega con nombre nulo e iniciales en la tarea suelta', async ({
    client,
    assert,
  }) => {
    const sinNombre = await cuenta(null)
    const tarea = await Task.create({
      title: 'Sin nombre',
      status: 'pending',
      assigneeId: sinNombre.id,
    })
    const token = await sesion(client)

    const response = await tareaSuelta(client, tarea.id, token)

    response.assertStatus(200)
    const assignee = response.body().data.assignee
    assert.isNull(assignee.fullName)
    assert.isString(assignee.initials)
    assert.isNotEmpty(assignee.initials)
    assert.notProperty(assignee, 'email')
  })

  test('un responsable sin nombre llega con nombre nulo e iniciales en la lista', async ({
    client,
    assert,
  }) => {
    const sinNombre = await cuenta(null)
    await Task.create({ title: 'Sin nombre', status: 'pending', assigneeId: sinNombre.id })
    const token = await sesion(client)

    const response = await lista(client, token)

    response.assertStatus(200)
    const assignee = response.body().data[0].assignee
    assert.isNull(assignee.fullName)
    assert.isString(assignee.initials)
    assert.isNotEmpty(assignee.initials)
    assert.notProperty(assignee, 'email')
  })
})
