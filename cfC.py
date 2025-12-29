def calc(x: str) -> int:
    n = len(x)
    a = 0
    b = 0
    if x[0] == 'u':
        a = 1
    if x[1] == 'u':
        b = a + 1
    else:
        b = a
    for i in range(2, n):
        if x[i] == 'u':
            c = 1
        else:
            c = 0
        c += min(a, b)
        a = b
        b = c
    return b

def main():
    t = int(input())
    for _ in range(t):
        x = input().strip()
        print(calc(x))

if __name__ == "__main__":
    main()
def compute(x):
    n = len(x)
    suf = -x[n - 1]
    best = x[n - 1]
    res = 0
    for i in range(n - 2, -1, -1):
        cur = suf + max(0, x[i] + best)
        suf -= x[i]
        best = max(best, cur - suf)
        if i == 0:
            res = cur
    return res

def main():
    t = int(input())
    out = []
    for _ in range(t):
        n = int(input())
        a = list(map(int, input().split()))
        out.append(compute(a))
    for v in out:
        print(v)

if __name__ == "__main__":
    main()