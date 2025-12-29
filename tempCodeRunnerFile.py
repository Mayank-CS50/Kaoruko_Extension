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