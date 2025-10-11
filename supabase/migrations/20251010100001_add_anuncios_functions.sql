-- Função para verificar se um anúncio está ativo
CREATE OR REPLACE FUNCTION public.is_anuncio_ativo(anuncio_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.anuncios
    WHERE id = anuncio_id
      AND ativo = true
      AND data_inicio <= NOW()
      AND data_fim >= NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter anúncios ativos por posição
CREATE OR REPLACE FUNCTION public.get_anuncios_ativos_por_posicao(posicao TEXT)
RETURNS SETOF public.anuncios AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.anuncios
  WHERE posicao = posicao
    AND ativo = true
    AND data_inicio <= NOW()
    AND data_fim >= NOW()
  ORDER BY ordem ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter um anúncio ativo por posição
CREATE OR REPLACE FUNCTION public.get_anuncio_ativo_por_posicao(posicao TEXT)
RETURNS public.anuncios AS $$
DECLARE
  anuncio_record public.anuncios;
BEGIN
  SELECT *
  INTO anuncio_record
  FROM public.anuncios
  WHERE posicao = posicao
    AND ativo = true
    AND data_inicio <= NOW()
    AND data_fim >= NOW()
  ORDER BY ordem ASC
  LIMIT 1;
  
  RETURN anuncio_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários para documentação
COMMENT ON FUNCTION public.is_anuncio_ativo(UUID) IS 'Verifica se um anúncio está ativo com base em seu ID';
COMMENT ON FUNCTION public.get_anuncios_ativos_por_posicao(TEXT) IS 'Obtém todos os anúncios ativos para uma determinada posição';
COMMENT ON FUNCTION public.get_anuncio_ativo_por_posicao(TEXT) IS 'Obtém um anúncio ativo para uma determinada posição';