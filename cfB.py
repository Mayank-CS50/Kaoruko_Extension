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