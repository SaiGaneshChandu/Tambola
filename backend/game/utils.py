import random

def generate_tambola_ticket():
    """
    Standard Tambola rules prakaaram 3x9 grid ticket generate chesthundhi.
    - Prathi row lo exact ga 5 numbers undali.
    - Prathi column lo range follow avvali (1-9, 10-19... 80-90).
    """
    # 1. Empty 3x9 grid create cheyyadam
    ticket = [[None for _ in range(9)] for _ in range(3)]
    
    # 2. Prathi column ki numbers allocate cheyyadam
    for col in range(9):
        start = col * 10 + 1
        end = (col + 1) * 10
        if col == 0: start = 1
        if col == 8: end = 90
        
        # Prathi column nundi random ga 1 to 2 numbers pick cheyyali (standard rule)
        count = random.choice([1, 2])
        column_nums = random.sample(range(start, end + 1), count)
        column_nums.sort()
        
        # Rows lo allocate cheyyadam
        for i, val in enumerate(column_nums):
            ticket[i][col] = val

    # 3. Row constraints check (Prathi row lo exact ga 5 numbers undali)
    for r in range(3):
        row_indices = [i for i, val in enumerate(ticket[r]) if val is not None]
        
        if len(row_indices) > 5:
            # Ekkuva unte random ga teeseyyali
            to_remove = random.sample(row_indices, len(row_indices) - 5)
            for idx in to_remove:
                ticket[r][idx] = None
        elif len(row_indices) < 5:
            # Takkuva unte random ga fill cheyyali
            empty_spots = [i for i, val in enumerate(ticket[r]) if val is None]
            to_add = random.sample(empty_spots, 5 - len(row_indices))
            for idx in to_add:
                start = idx * 10 + 1
                ticket[r][idx] = random.randint(start, start + 8)

    return ticket

def get_shuffled_numbers():
    """
    Game board kosam 1 nundi 90 varaku numbers ni shuffle chesi isthundhi.
    """
    numbers = list(range(1, 91))
    random.shuffle(numbers)
    return numbers