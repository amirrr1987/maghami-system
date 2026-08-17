export async function tryMutate<T>(run: Promise<T>): Promise<T | null> {
  try {
    return await run
  } catch {
    return null
  }
}

export async function tryMutateOk(run: Promise<unknown>): Promise<boolean> {
  try {
    await run
    return true
  } catch {
    return false
  }
}
