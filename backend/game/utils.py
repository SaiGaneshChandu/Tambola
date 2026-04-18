import random

def generate_ticket():
    ticket = [[0 for _ in range(9)] for _ in range(3)]
    total_numbers = 0
    
    # Prathi column lo కనీసం oka number undali
    for col in range(9):
        start = col * 10 + 1
        end = (col + 1) * 10 if col < 8 else 90
        row = random.randint(0, 2)
        ticket[row][col] = random.randint(start, end)
        total_numbers += 1

    # Total 15 numbers ayye varaku fill cheyyali
    while total_numbers < 15:
        row = random.randint(0, 2)
        col = random.randint(0, 9)
        if ticket[row][col] == 0:
            start = col * 10 + 1
            end = (col + 1) * 10 if col < 8 else 90
            num = random.randint(start, end)
            if num not in [ticket[r][col] for r in range(3)]:
                if sum(1 for x in ticket[row] if x > 0) < 5:
                    ticket[row][col] = num
                    total_numbers += 1
    return ticket