
def print_all_glyph_data(font):
    for glyph in font.glyphs:
#        print('<glyph unicode=\" f"{glyph.unicode}\" , f"name=\"{glyph.name}\"")
        print(f"<glyph name=\"{glyph.name}\"" ,  f"category=\"{glyph.category}\"", f"subCategory=\"{glyph.subCategory}\"", f"script=\"{glyph.script}\"", f"production=\"{glyph.productionName}\"" "/>" )

# Example usage:
font = Glyphs.font
if font:
    print_all_glyph_data(font)
else:
    print("No font open in Glyphs app.")
