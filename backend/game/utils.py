import random

def generate_ticket():
    # Standard Tambola: 9 columns, 3 rows, 15 numbers total
    ticket = [[0 for _ in range(9)] for _ in range(3)]
    total_numbers = 0
    
    for col in range(9):
        # Column ranges: 1-9, 10-19... 80-90
        start = col * 10 + 1
        end = (col + 1) * 10 if col < 8 else 90
        
        # Prathi column lo కనీసం okka number undali
        row = random.randint(0, 2)
        ticket[row][col] = random.randint(start, end)
        total_numbers += 1

    # Migilina 6 numbers ni random ga fill cheyyali (total 15 avvalante)
    while total_numbers < 15:
        row = random.randint(0, 2)
        col = random.randint(0, 9)
        if ticket[row][col] == 0:
            start = col * 10 + 1
            end = (col + 1) * 10 if col < 8 else 90
            num = random.randint(start, end)
            
            # Column lo duplicate lekunda chuskovali
            if num not in [ticket[r][col] for r in range(3)]:
                ticket[row][col] = num
                total_numbers += 1
    return ticket