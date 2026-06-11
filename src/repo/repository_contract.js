// Abstract base class
export class RepositoryContract {
  constructor() {
    if (new.target === RepositoryContract) {
      throw new Error("Cannot instantiate abstract class");
    }
  }

  async add(item) {
    throw new Error("Not implemented");
  }

  async getById(id) {
    throw new Error("Not implemented");
  }

  async getAll() {
    throw new Error("Not implemented");
  }

  async update(item) {
    throw new Error("Not implemented");
  }

  async remove(id) {
    throw new Error("Not implemented");
  }
}