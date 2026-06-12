from PIL import Image

# Abre a imagem original (1024x550, RGBA)
img = Image.open(r'C:\Users\RICARDO\.gemini\antigravity-ide\brain\0aec9ade-8c3c-4424-9fd6-49377a84cd48\uploaded_media_1781297380790.png')
print(f'Modo: {img.mode}, Tamanho: {img.size}')

width, height = img.size  # 1024 x 550

# O escudo esta centralizado horizontalmente
# Recortar um quadrado de 550x550 centrado na imagem
crop_size = height  # 550
left = (width - crop_size) // 2
top = 0
right = left + crop_size
bottom = crop_size

shield = img.crop((left, top, right, bottom))
print(f'Recortado para: {shield.size}')

# Redimensiona para 512x512 (tamanho limpo)
shield = shield.resize((512, 512), Image.LANCZOS)

# Compoe sobre fundo verde #133215
bg = Image.new('RGB', shield.size, (19, 50, 21))
if shield.mode == 'RGBA':
    r, g, b, a = shield.split()
    bg.paste(shield.convert('RGB'), mask=a)
else:
    bg.paste(shield)

bg.save('public/logo.png')
print('Salvo com sucesso! Tamanho final:', bg.size)
