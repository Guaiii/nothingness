// 计算器纯状态机：无 DOM、无副作用，是计算器 module 的实现；接口即测试面。
// DOM 仅为 adapter（calculator.astro），见架构诊断③/⑥。

export type Operator = "add" | "subtract" | "multiply" | "divide";
export type Action =
  | { type: "digit"; value: string } // 数字或小数点
  | { type: "operator"; operator: Operator }
  | { type: "equals" }
  | { type: "clear" }
  | { type: "backspace" }
  | { type: "percentage" };

export interface CalcState {
  current: string;
  previous: string;
  operator: Operator | null;
  /** true 表示下一次输入数字会覆盖当前值（刚按运算符或等号） */
  waitingForOperand: boolean;
}

export function initialState(): CalcState {
  return { current: "0", previous: "", operator: null, waitingForOperand: false };
}

function toNumber(value: string): number {
  return parseFloat(value || "0");
}

function compute(previous: string, current: string, operator: Operator): number {
  const prev = toNumber(previous);
  const next = toNumber(current);
  switch (operator) {
    case "add":
      return prev + next;
    case "subtract":
      return prev - next;
    case "multiply":
      return prev * next;
    case "divide":
      // 除零按原 UI 行为返回 0，避免 Infinity 写进显示
      return next === 0 ? 0 : prev / next;
  }
}

/** 规整数字转字符串：去多余的尾零、避免浮点长小数 */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";
  // 限制浮点精度，避免 0.1+0.2 这类长小数
  const rounded = Math.round((value + Number.EPSILON) * 1e12) / 1e12;
  return String(rounded);
}

export function reducer(state: CalcState, action: Action): CalcState {
  switch (action.type) {
    case "digit": {
      const value = action.value;
      if (value === ".") {
        if (state.waitingForOperand) {
          return { ...state, current: "0.", waitingForOperand: false };
        }
        if (state.current.includes(".")) return state;
        return { ...state, current: state.current + "." };
      }

      if (state.waitingForOperand) {
        return { ...state, current: value === "0" ? "0" : value, waitingForOperand: false };
      }
      return {
        ...state,
        current: state.current === "0" ? value : state.current + value,
      };
    }

    case "operator": {
      // 已在等待操作数时按运算符：仅更换运算符
      if (state.waitingForOperand && state.operator) {
        return { ...state, operator: action.operator };
      }
      // 连续运算：先把上一步算完
      if (state.operator && state.previous !== "") {
        const result = compute(state.previous, state.current, state.operator);
        return {
          current: formatNumber(result),
          previous: formatNumber(result),
          operator: action.operator,
          waitingForOperand: true,
        };
      }
      return {
        ...state,
        previous: state.current,
        operator: action.operator,
        waitingForOperand: true,
      };
    }

    case "equals": {
      if (!state.operator || state.previous === "") return state;
      const result = compute(state.previous, state.current, state.operator);
      return {
        current: formatNumber(result),
        previous: "",
        operator: null,
        waitingForOperand: true,
      };
    }

    case "clear":
      return initialState();

    case "backspace": {
      if (state.waitingForOperand) return state;
      const removed = state.current.slice(0, -1);
      return { ...state, current: removed === "" || removed === "-" ? "0" : removed };
    }

    case "percentage":
      return { ...state, current: formatNumber(toNumber(state.current) / 100) };
  }
}
