
def rename_glyphs(old_new_mapping):
    for old_name, new_name in old_new_mapping.items():
        glyph = Glyphs.font.glyphs[old_name]

        if glyph:
            glyph.name = new_name
            print(f"Renamed {old_name} to {new_name}")
        else:
            print(f"Glyph {old_name} not found in the font")

# Example usage:
old_new_mapping = {


'snA':	'a-sinhala',
'snAA':	'aa-sinhala',
'snAAE':	'aae-sinhala',
'snAE':	'ae-sinhala',
'snAI':	'ai-sinhala',
'snAU':	'au-sinhala',
'snBA':	'ba-sinhala',
'snBHA':	'bha-sinhala',
'snCA':	'ca-sinhala',
'snCHA':	'cha-sinhala',
'snDA':	'da-sinhala',
'snDDA':	'dda-sinhala',
'snDDHA':	'ddha-sinhala',
'snDHA':	'dha-sinhala',
'snE':	'e-sinhala',
'snEE':	'ee-sinhala',
'snFA':	'fa-sinhala',
'snGA':	'ga-sinhala',
'snGHA':	'gha-sinhala',
'snHA':	'ha-sinhala',
'snI':	'i-sinhala',
'snII':	'ii-sinhala',
'snJA':	'ja-sinhala',
'snJHA':	'jha-sinhala',
'snJNYA':	'jnya-sinhala',
'snKA':	'ka-sinhala',
'snKHA':	'kha-sinhala',
'snLA':	'la-sinhala',
'snLLA':	'lla-sinhala',
'snMA':	'ma-sinhala',
'snMBA':	'mba-sinhala',
'snNA':	'na-sinhala',
'snNDA':	'nda-sinhala',
'snNGA':	'nga-sinhala',
'snNNA':	'nna-sinhala',
'snNNDDA':	'nndda-sinhala',
'snNNGA':	'nnga-sinhala',
'snNYA':	'nya-sinhala',
'snNYJA':	'nyja-sinhala',
'snO':	'o-sinhala',
'snOO':	'oo-sinhala',
'snPA':	'pa-sinhala',
'snPHA':	'pha-sinhala',
'snRA':	'ra-sinhala',
'snSA':	'sa-sinhala',
'snSHA':	'sha-sinhala',
'snSSA':	'ssa-sinhala',
'snTA':	'ta-sinhala',
'snTHA':	'tha-sinhala',
'snTTA':	'tta-sinhala',
'snTTHA':	'ttha-sinhala',
'snU':	'u-sinhala',
'snUU':	'uu-sinhala',
'snVA':	'va-sinhala',
'snYA':	'ya-sinhala',
'snvL':	'vocalicL-sinhala',
'snvLL':	'vocalicll-sinhala',
'snvR':	'vocalicr-sinhala',
'snvRR':	'vocalicrr-sinhala',
'snKunddaliya':	'kunddaliya-sinhala',
'snVirama':	'virama-sinhala',
'snmI':	'sign-i-sinhala',
'snmII':	'sign-ii-sinhala',
'snmU':	'sign-u-sinhala',
'snmUU':	'sign-uu-sinhala',
'snmAA':	'sign-aa-sinhala',
'snmAAE':	'sign-aae-sinhala',
'snmAE':	'sign-ae-sinhala',
'snmAI':	'sign-ai-sinhala',
'snmE':	'sign-e-sinhala',
'snmvL':	'sign-vl-sinhala',
'snmvLL':	'sign-vll-sinhala',
'snmvR':	'sign-vr-sinhala',
'snmvRR':	'sign-vrr-sinhala',
'snmAU':	'sign-au-sinhala',
'snmEE':	'sign-ee-sinhala',
'snmO':	'sign-o-sinhala',
'snmOO':	'sign-oo-sinhala',
'snAnusvara':	'anusvara-sinhala',
'snVisarga':	'visarga-sinhala',
'snBA_Virama':	'ba_virama-sinhala',
'snBA_mI':	'bi-sinhala',
'snBA_mII':	'bii-sinhala',
'snBHA_mU':	'bhu-sinhala',
'snBHA_mUU':	'bhuu-sinhala',
'snCA_Virama':	'ca_virama-sinhala',
'snCA_mI':	'ci-sinhala',
'snCA_mII':	'cii-sinhala',
'snCHA_Virama':	'cha_virama-sinhala',
'snCHA_mI':	'chi-sinhala',
'snCHA_mII':	'chii-sinhala',
'snDA_mI':	'di-sinhala',
'snDA_mII':	'dii-sinhala',
'snDA_mU':	'du-sinhala',
'snDA_mUU':	'duu-sinhala',
'snDDA_Virama':	'dda_virama-sinhala',
'snDDA_mI':	'ddi-sinhala',
'snDDA_mII':	'ddii-sinhala',
'snDDHA_Virama':	'ddha_virama-sinhala',
'snDDHA_mI':	'ddhi-sinhala',
'snDDHA_mII':	'ddhii-sinhala',
'snDHA_Virama':	'dha_virama-sinhala',
'snDHA_mI':	'dhi-sinhala',
'snDHA_mII':	'dhii-sinhala',
'snD_DHA':	'd_dha-sinhala',
'snD_DHA_Virama':	'd_dha_virama-sinhala',
'snD_DHA_mI':	'd_dhi-sinhala',
'snD_DHA_mII':	'd_dhii-sinhala',
'snD_RA':	'd_ra-sinhala',
'snD_VA':	'd_va-sinhala',
'snD_VA_Virama':	'd_va_virama-sinhala',
'snD_VA_mI':	'd_vi-sinhala',
'snD_VA_mII':	'd_vii-sinhala',
'snGA_mU':	'gu-sinhala',
'snGA_mUU':	'guu-sinhala',
'snG_DHA':	'g_dha-sinhala',
'snG_DHA_Virama':	'g_dha_virama-sinhala',
'snG_DHA_mI':	'g_dhi-sinhala',
'snG_DHA_mII':	'g_dhii-sinhala',
'snHA_mU':	'hu-sinhala',
'snHA_mUU':	'huu-sinhala',
'snJA_Virama':	'ja_virama-sinhala',
'snJA_mI':	'ji-sinhala',
'snJA_mII':	'jii-sinhala',
'snJHA_Virama':	'jha_virama-sinhala',
'snJHA_mI':	'jhi-sinhala',
'snJHA_mII':	'jhii-sinhala',
'snJNYA_mU':	'jnyu-sinhala',
'snJNYA_mUU':	'jnyuu-sinhala',
'snJNY_RA':	'jny_ra-sinhala',
'snKA_mU':	'ku-sinhala',
'snKA_mUU':	'kuu-sinhala',
'snKHA_Virama':	'kha_virama-sinhala',
'snKHA_mI':	'khi-sinhala',
'snKHA_mII':	'khii-sinhala',
'snK_SSA':	'k_ssa-sinhala',
'snK_VA':	'k_va-sinhala',
'snK_VA_Virama':	'k_va_virama-sinhala',
'snK_VA_mI':	'k_vi-sinhala',
'snK_VA_mII':	'k_vii-sinhala',
'snLA_mU':	'lu-sinhala',
'snLA_mUU':	'luu-sinhala',
'snLLA_mU':	'llu-sinhala',
'snLLA_mUU':	'lluu-sinhala',
'snLL_RA':	'll_ra-sinhala',
'snMA_Virama':	'ma_virama-sinhala',
'snMA_mI':	'mi-sinhala',
'snMA_mII':	'mii-sinhala',
'snMBA_Virama':	'mba_virama-sinhala',
'snMBA_mI':	'mbi-sinhala',
'snMBA_mII':	'mbii-sinhala',
'snNA_mU':	'nu-sinhala',
'snNA_mUU':	'nuu-sinhala',
'snNDA_mU':	'ndu-sinhala',
'snNDA_mUU':	'nduu-sinhala',
'snND_RA':	'nd_ra-sinhala',
'snNGA_Virama':	'nga_virama-sinhala',
'snNGA_mI':	'ngi-sinhala',
'snNGA_mII':	'ngii-sinhala',
'snNNA_mI':	'nni-sinhala',
'snNNA_mII':	'nnii-sinhala',
'snNNDDA_Virama':	'nndda_virama-sinhala',
'snNNDDA_mI':	'nnddi-sinhala',
'snNNDDA_mII':	'nnddii-sinhala',
'snNNGA_mU':	'nngu-sinhala',
'snNNGA_mUU':	'nnguu-sinhala',
'snNYA_mU':	'nyu-sinhala',
'snNYA_mUU':	'nyuu-sinhala',
'snNYJA_Virama':	'nyja_virama-sinhala',
'snNYJA_mI':	'nyji-sinhala',
'snNYJA_mII':	'nyjii-sinhala',
'snNY_CA':	'ny_ca-sinhala',
'snNY_CA_Virama':	'ny_ca_virama-sinhala',
'snNY_CA_mI':	'ny_ci-sinhala',
'snNY_CA_mII':	'ny_cii-sinhala',
'snNY_RA':	'ny_ra-sinhala',
'snN_DA':	'n_da-sinhala',
'snN_DA_mU':	'n_du-sinhala',
'snN_DA_mUU':	'n_duu-sinhala',
'snN_DHA':	'n_dha-sinhala',
'snN_DHA_Virama':	'n_dha_virama-sinhala',
'snN_DHA_mI':	'n_dhi-sinhala',
'snN_DHA_mII':	'n_dhii-sinhala',
'snN_D_RA':	'n_d_ra-sinhala',
'snN_THA':	'n_tha-sinhala',
'snN_THA_Virama':	'n_tha_virama-sinhala',
'snN_THA_mI':	'n_thi-sinhala',
'snN_THA_mII':	'n_thii-sinhala',
'snN_VA':	'n_va-sinhala',
'snN_VA_Virama':	'n_va_virama-sinhala',
'snN_VA_mI':	'n_vi-sinhala',
'snN_VA_mII':	'n_vii-sinhala',
'snPHA_Virama':	'pha_virama-sinhala',
'snPHA_mI':	'phi-sinhala',
'snPHA_mII':	'phii-sinhala',
'snPH_RA':	'ph_ra-sinhala',
'snRA_Virama':	'ra_virama-sinhala',
'snRA_mAAE':	'raae-sinhala',
'snRA_mAE':	'rae-sinhala',
'snRA_mI':	'ri-sinhala',
'snRA_mII':	'rii-sinhala',
'snRA_mU':	'ru-sinhala',
'snRA_mUU':	'ruu-sinhala',
'snRAc2':	'rac2-sinhala',
'snReph':	'reph-sinhala',
'snSHA_mU':	'shu-sinhala',
'snSHA_mUU':	'shuu-sinhala',
'snTA_mU':	'tu-sinhala',
'snTA_mUU':	'tuu-sinhala',
'snTHA_Virama':	'tha_virama-sinhala',
'snTHA_mI':	'thi-sinhala',
'snTHA_mII':	'thii-sinhala',
'snTTA_Virama':	'tta_virama-sinhala',
'snTTA_mI':	'tti-sinhala',
'snTTA_mII':	'ttii-sinhala',
'snTTHA_Virama':	'ttha_virama-sinhala',
'snTTHA_mI':	'tthi-sinhala',
'snTTHA_mII':	'tthii-sinhala',
'snTT_TTHA':	'tt_ttha-sinhala',
'snTT_TTHA_Virama':	'tt_ttha_virama-sinhala',
'snTT_TTHA_mI':	'tt_tthi-sinhala',
'snTT_TTHA_mII':	'tt_tthii-sinhala',
'snT_THA':	't_tha-sinhala',
'snT_THA_Virama':	't_tha_virama-sinhala',
'snT_THA_mI':	't_thi-sinhala',
'snT_THA_mII':	't_thii-sinhala',
'snT_VA':	't_va-sinhala',
'snT_VA_Virama':	't_va_virama-sinhala',
'snT_VA_mI':	't_vi-sinhala',
'snT_VA_mII':	't_vii-sinhala',
'snTouch':	'touch-sinhala',
'snVA_Virama':	'va_virama-sinhala',
'snVA_mI':	'vi-sinhala',
'snVA_mII':	'vii-sinhala',
'snYAc2':	'yac2-sinhala',
    
    }  # Replace with your actual mapping
rename_glyphs(old_new_mapping)
