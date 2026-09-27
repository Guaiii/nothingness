import { describe, it, expect } from "vitest";
import { reducer, initialState, formatNumber, type Action, type Operator } from "./calculator-engine";

// 测试辅助：按顺序派发一组动作
function run(actions: Action[]) {
  return actions.reduce(reducer, initialState());
}

const digit = (value: string): Action => ({ type: "digit", value });
const op = (operator: Operator): Action => ({ type: "operator", operator });
const equals: Action = { type: "equals" };

describe("calculator engine", () => {
  it("初始显示 0", () => {
    expect(initialState().current).toBe("0");
  });

  it("逐位输入，首位 0 不重复", () => {
    expect(run([digit("1"), digit("2")]).current).toBe("12");
    expect(run([digit("0"), digit("5")]).current).toBe("5");
  });

  it("小数点只允许一个", () => {
    expect(run([digit("1"), digit("."), digit("2"), digit(".")]).current).toBe("1.2");
  });

  it("在等待操作数时输入数字会覆盖显示", () => {
    const s = run([digit("9"), op("add"), digit("3")]);
    expect(s.current).toBe("3");
    expect(s.waitingForOperand).toBe(false);
  });

  it("基础加减乘除", () => {
    expect(run([digit("2"), op("add"), digit("3"), equals]).current).toBe("5");
    expect(run([digit("5"), op("subtract"), digit("8"), equals]).current).toBe("-3");
    expect(run([digit("4"), op("multiply"), digit("2"), equals]).current).toBe("8");
    expect(run([digit("8"), op("divide"), digit("2"), equals]).current).toBe("4");
  });

  it("连续运算（按运算符时先结算上一步）", () => {
    expect(run([digit("2"), op("add"), digit("3"), op("add"), digit("4"), equals]).current).toBe("9");
  });

  it("等待操作数时改运算符", () => {
    const s = run([digit("2"), op("add"), op("multiply"), digit("3"), equals]);
    expect(s.current).toBe("6");
  });

  it("除以零返回 0（与原 UI 约定一致）", () => {
    expect(run([digit("8"), op("divide"), digit("0"), equals]).current).toBe("0");
  });

  it("百分比", () => {
    expect(run([digit("5"), digit("0"), { type: "percentage" }]).current).toBe("0.5");
  });

  it("退格：删空回到 0，等号后不生效", () => {
    expect(run([digit("1"), digit("2"), { type: "backspace" }]).current).toBe("1");
    expect(run([digit("1"), digit("2"), { type: "backspace" }, { type: "backspace" }]).current).toBe("0");
    expect(run([digit("1"), op("add"), digit("2"), equals, { type: "backspace" }]).current).toBe("3");
  });

  it("清空回到初始状态", () => {
    expect(run([digit("9"), op("add"), { type: "clear" }])).toEqual(initialState());
  });

  it("formatNumber 修正浮点误差", () => {
    expect(formatNumber(0.1 + 0.2)).toBe("0.3");
    expect(formatNumber(Infinity)).toBe("0");
  });
});
