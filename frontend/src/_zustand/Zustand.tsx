//export const cloneState = (obj: CreateClusterStore): CreateClusterStore => Object.assign(Object.create(obj), obj)

export interface BaseZustandState {
  id: string
}

export class ZustandUtils {
  static cloneState(obj: BaseZustandState): BaseZustandState {
    return Object.assign(Object.create(obj), obj)
  }

  static setState(zustandSet: (state: (s1: any) => any) => any, zustandGet: () => any, f: (s2: any) => void) {
    zustandSet(
      ((s1: any) => {
        const newState = ZustandUtils.cloneState(s1)

        f(newState)

        return JSON.parse(JSON.stringify(newState))
      })(zustandGet())
    )
  }

  static setState2(zustandSet: (state: (s1: any) => any) => any, zustandGet: () => any, f: (s2: any) => void) {
    zustandSet(
      ((s1: any) => {
        f(s1)

        return s1
      })(zustandGet())
    )
  }

  static printJson(obj: any): string {
    return JSON.stringify(obj, undefined, 2)
  }
}
