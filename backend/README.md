��#   b a c k e y 
 
 
 
 C r e a t i n g   a   f l o w c h a r t   t o   v i s u a l i z e   t h e   f l o w   a n d   r e l a t i o n s h i p s   i n   t h e   P r i s m a   s c h e m a   y o u   p r o v i d e d   w o u l d   b e   a   g r e a t   w a y   t o   u n d e r s t a n d   t h e   s y s t e m   s t r u c t u r e   a n d   i n t e r a c t i o n s .   S i n c e   I   c a n  t   d i r e c t l y   d r a w   o r   d i s p l a y   i m a g e s   h e r e ,   I  l l   d e s c r i b e   a   d e t a i l e d   f l o w c h a r t   s t r u c t u r e   t h a t   y o u   c a n   u s e   t o   c r e a t e   o n e   y o u r s e l f   u s i n g   t o o l s   l i k e   L u c i d c h a r t ,   D r a w . i o ,   o r   e v e n   p e n   a n d   p a p e r .   T h e   f l o w c h a r t   w i l l   i l l u s t r a t e   t h e   m a i n   e n t i t i e s ,   t h e i r   r e l a t i o n s h i p s ,   a n d   t h e   t y p i c a l   f l o w   o f   o p e r a t i o n s . 
 
 
 
 - - - 
 
 
 
 # # #   F l o w c h a r t   D e s c r i p t i o n :   S y s t e m   F l o w   a n d   R e l a t i o n s h i p s 
 
 
 
 # # # #   1 .   * * S t a r t i n g   P o i n t :   U s e r   R e g i s t r a t i o n * * 
 
 
 
 -       * * S h a p e * * :   O v a l   ( S t a r t / E n d ) 
 
 -       * * L a b e l * * :   " U s e r   R e g i s t e r s " 
 
 -       * * D e s c r i p t i o n * * :   T h i s   i s   t h e   e n t r y   p o i n t   w h e r e   a   n e w   u s e r   c r e a t e s   a n   a c c o u n t   ( U s e r   m o d e l ) . 
 
 
 
 # # # #   2 .   * * M a i n   E n t i t i e s   ( R e c t a n g l e s ) * * 
 
 
 
 E a c h   e n t i t y   f r o m   t h e   s c h e m a   w i l l   b e   a   r e c t a n g l e ,   c o n n e c t e d   b y   a r r o w s   t o   s h o w   r e l a t i o n s h i p s   a n d   f l o w . 
 
 
 
 -       * * U s e r * * : 
 
 
 
         -       C o n n e c t e d   t o : 
 
                 -       " C r e a t e s / J o i n s "   �!  * * W o r k s p a c e * *   ( o n e - t o - m a n y :   U s e r   c a n   o w n   o r   j o i n   m u l t i p l e   W o r k s p a c e s ) . 
 
                 -       " M a n a g e s "   �!  * * B o a r d * *   ( v i a   B o a r d U s e r ,   m a n y - t o - m a n y ) . 
 
                 -       " P l a c e s "   �!  * * O r d e r * * ,   * * C a r t I t e m * * ,   * * B i l l * *   ( o n e - t o - m a n y ) . 
 
                 -       " H a s "   �!  * * A d d r e s s * *   ( o n e - t o - m a n y ) . 
 
                 -       " S e n d s / R e c e i v e s "   �!  * * I n v i t a t i o n * *   ( m a n y - t o - m a n y ) . 
 
 
 
 -       * * W o r k s p a c e * * : 
 
 
 
         -       C o n n e c t e d   t o : 
 
                 -       " O w n e d   b y "   �!  * * U s e r * *   ( o n e - t o - o n e   o r   o n e - t o - m a n y ) . 
 
                 -       " C o n t a i n s "   �!  * * B o a r d * * ,   * * P r o d u c t * * ,   * * C a t e g o r y * * ,   * * S t o r e * * ,   * * O r d e r * *   ( o n e - t o - m a n y ) . 
 
                 -       " M a n a g e s "   �!  * * R o l e P e r m i s s i o n * *   ( o n e - t o - m a n y ) . 
 
                 -       " H a n d l e s "   �!  * * I n v i t a t i o n * *   ( o n e - t o - m a n y ) . 
 
 
 
 -       * * B o a r d * * : 
 
 
 
         -       C o n n e c t e d   t o : 
 
                 -       " B e l o n g s   t o "   �!  * * W o r k s p a c e * *   ( m a n y - t o - o n e ) . 
 
                 -       " I n c l u d e s "   �!  * * U s e r * *   ( v i a   B o a r d U s e r ,   m a n y - t o - m a n y ) . 
 
                 -       " M a n a g e s "   �!  * * P r o d u c t * * ,   * * I n v i t a t i o n * *   ( o n e - t o - m a n y ) . 
 
 
 
 -       * * P r o d u c t * * : 
 
 
 
         -       C o n n e c t e d   t o : 
 
                 -       " B e l o n g s   t o "   �!  * * W o r k s p a c e * *   o r   * * B o a r d * *   ( m a n y - t o - o n e ) . 
 
                 -       " O r g a n i z e d   i n "   �!  * * C a t e g o r y * *   ( m a n y - t o - o n e ) . 
 
                 -       " H a s "   �!  * * P r o d u c t V a r i a n t * *   ( o n e - t o - m a n y ) . 
 
                 -       " A p p e a r s   i n "   �!  * * C a r t I t e m * * ,   * * O r d e r I t e m * * ,   * * B i l l I t e m * *   ( o n e - t o - m a n y ) . 
 
 
 
 -       * * O r d e r * * : 
 
 
 
         -       C o n n e c t e d   t o : 
 
                 -       " P l a c e d   b y "   �!  * * U s e r * *   ( m a n y - t o - o n e ) . 
 
                 -       " U s e s "   �!  * * A d d r e s s * *   ( f o r   s h i p p i n g / b i l l i n g ,   m a n y - t o - o n e ) . 
 
                 -       " C o n t a i n s "   �!  * * O r d e r I t e m * *   ( o n e - t o - m a n y ) . 
 
                 -       " B e l o n g s   t o "   �!  * * W o r k s p a c e * *   ( o p t i o n a l ,   m a n y - t o - o n e ) . 
 
 
 
 -       * * C a r t I t e m * * ,   * * O r d e r I t e m * * ,   * * B i l l I t e m * * : 
 
 
 
         -       C o n n e c t e d   t o : 
 
                 -       " L i n k e d   t o "   �!  * * P r o d u c t V a r i a n t * *   ( m a n y - t o - o n e ) . 
 
                 -       " P a r t   o f "   �!  * * C a r t * *   ( f o r   C a r t I t e m ) ,   * * O r d e r * *   ( f o r   O r d e r I t e m ) ,   * * B i l l * *   ( f o r   B i l l I t e m ) . 
 
 
 
 -       * * I n v i t a t i o n * * : 
 
 
 
         -       C o n n e c t e d   t o : 
 
                 -       " S e n t   b y "   �!  * * U s e r * *   ( m a n y - t o - o n e ) . 
 
                 -       " T a r g e t s "   �!  * * U s e r * *   ( m a n y - t o - o n e ,   o p t i o n a l   u n t i l   a c c e p t e d ) . 
 
                 -       " F o r "   �!  * * W o r k s p a c e * *   o r   * * B o a r d * *   ( m a n y - t o - o n e ) . 
 
 
 
 -       * * A d d r e s s * * ,   * * S t o r e * * ,   * * C a t e g o r y * * ,   * * R o l e P e r m i s s i o n * * :   S u p p o r t i n g   e n t i t i e s   c o n n e c t e d   t o   t h e i r   p a r e n t   m o d e l s   ( e . g . ,   A d d r e s s   t o   U s e r ,   S t o r e   t o   W o r k s p a c e ) . 
 
 
 
 # # # #   3 .   * * D e c i s i o n   P o i n t s   ( D i a m o n d s ) * * 
 
 
 
 -       * * I s   U s e r   I n v i t e d ? * * : 
 
 
 
         -       Y e s   �!  " A c c e p t   I n v i t a t i o n "   �!  * * U s e r * *   j o i n s   * * W o r k s p a c e * *   o r   * * B o a r d * * . 
 
         -       N o   �!  " C r e a t e   N e w   W o r k s p a c e "   o r   " R e g i s t e r   N e w   U s e r . " 
 
 
 
 -       * * I s   O r d e r   P l a c e d ? * * : 
 
 
 
         -       Y e s   �!  " P r o c e s s   O r d e r "   �!  U p d a t e   * * O r d e r S t a t u s * *   ( e . g . ,   P E N D I N G   �!  D E L I V E R E D ) . 
 
         -       N o   �!  " A d d   t o   C a r t "   o r   " C a n c e l . " 
 
 
 
 -       * * I s   P r o d u c t   A v a i l a b l e ? * * : 
 
         -       Y e s   �!  " A d d   t o   O r d e r / C a r t . " 
 
         -       N o   �!  " N o t i f y   U s e r "   ( e . g . ,   o u t   o f   s t o c k ) . 
 
 
 
 # # # #   4 .   * * F l o w   A r r o w s * * 
 
 
 
 -       U s e   s o l i d   a r r o w s   ( �!)   f o r   d i r e c t   r e l a t i o n s h i p s   ( e . g . ,   U s e r   �!  W o r k s p a c e ) . 
 
 -       U s e   d a s h e d   a r r o w s   ( - - > )   f o r   o p t i o n a l   o r   c o n d i t i o n a l   f l o w s   ( e . g . ,   W o r k s p a c e   - - o p t i o n a l - - >   O r d e r ) . 
 
 -       L a b e l   a r r o w s   w i t h   a c t i o n s   ( e . g . ,   " C r e a t e s , "   " M a n a g e s , "   " P l a c e s " ) . 
 
 
 
 # # # #   5 .   * * E n d   P o i n t s * * 
 
 
 
 -       * * S h a p e * * :   O v a l   ( E n d ) 
 
 -       * * L a b e l * * :   " O r d e r   D e l i v e r e d , "   " U s e r   D e a c t i v a t e d , "   " I n v i t a t i o n   E x p i r e d , "   e t c . 
 
 
 
 - - - 
 
 
 
 # # #   E x a m p l e   F l o w c h a r t   L a y o u t 
 
 
 
 ` ` ` 
 
 [ S t a r t :   U s e r   R e g i s t e r s ]   �!  [ U s e r ] 
 
         �!
 
 [ D e c i s i o n :   I s   U s e r   I n v i t e d ? ]   �!  Y e s   �!  [ A c c e p t   I n v i t a t i o n ]   �!  [ W o r k s p a c e / B o a r d ]   �!  [ U s e r ] 
 
                                                                   N o     �!  [ C r e a t e   W o r k s p a c e ]   �!  [ W o r k s p a c e ] 
 
         �!
 
 [ U s e r ]   �!  [ M a n a g e s ]   �!  [ W o r k s p a c e ]   �!  [ C o n t a i n s ]   �!  [ B o a r d ]   �!  [ I n c l u d e s ]   �!  [ U s e r   ( v i a   B o a r d U s e r ) ] 
 
         |                                                     �!
 
         |                                             [ C o n t a i n s ]   �!  [ P r o d u c t ]   �!  [ H a s ]   �!  [ P r o d u c t V a r i a n t ] 
 
         |                                                     �!
 
         |                                             [ C o n t a i n s ]   �!  [ C a t e g o r y ]   �!  [ O r g a n i z e s ]   �!  [ P r o d u c t ] 
 
         |                                                     �!
 
         |                                             [ H a n d l e s ]   �!  [ I n v i t a t i o n ]   �!  [ S e n t   t o ]   �!  [ U s e r ] 
 
         �!
 
 [ U s e r ]   �!  [ P l a c e s ]   �!  [ O r d e r ]   �!  [ U s e s ]   �!  [ A d d r e s s ]   �!  [ C o n t a i n s ]   �!  [ O r d e r I t e m ]   �!  [ L i n k e d   t o ]   �!  [ P r o d u c t V a r i a n t ] 
 
         |                                                     �!
 
         |                                             [ S t a t u s   U p d a t e ]   �!  [ D e c i s i o n :   D e l i v e r e d ? ]   �!  Y e s   �!  [ E n d :   O r d e r   D e l i v e r e d ] 
 
         |                                                                                                                               N o     �!  [ P r o c e s s i n g ] 
 
         �!
 
 [ U s e r ]   �!  [ A d d s   t o ]   �!  [ C a r t I t e m ]   �!  [ L i n k e d   t o ]   �!  [ P r o d u c t V a r i a n t ]   �!  [ C h e c k o u t ]   �!  [ O r d e r ] 
 
         �!
 
 [ E n d :   U s e r   D e a c t i v a t e d / I n v i t a t i o n   E x p i r e d ] 
 
 ` ` ` 
 
 
 
 - - - 
 
 
 
 # # #   6 .   * * V i s u a l   T i p s * * 
 
 
 
 -       U s e   d i f f e r e n t   c o l o r s   f o r   e n t i t i e s   ( e . g . ,   b l u e   f o r   U s e r s ,   g r e e n   f o r   W o r k s p a c e s ,   y e l l o w   f o r   P r o d u c t s ) . 
 
 -       G r o u p   r e l a t e d   m o d e l s   ( e . g . ,   a l l   c o m m e r c e   m o d e l s   l i k e   O r d e r ,   C a r t ,   B i l l   t o g e t h e r ) . 
 
 -       U s e   a   h i e r a r c h i c a l   l a y o u t :   S t a r t   w i t h   U s e r   a t   t h e   t o p ,   t h e n   W o r k s p a c e   a n d   B o a r d ,   t h e n   P r o d u c t s   a n d   O r d e r s   b e l o w . 
 
 
 
 I f   y o u   n e e d   m e   t o   g e n e r a t e   a n   i m a g e   o f   t h i s   f l o w c h a r t ,   p l e a s e   l e t   m e   k n o w ,   a n d   I   c a n   d e s c r i b e   i t   i n   m o r e   d e t a i l   o r   a s s i s t   w i t h   t e x t - b a s e d   v i s u a l i z a t i o n   t o o l s .   A l t e r n a t i v e l y ,   y o u   c a n   i n p u t   t h i s   s t r u c t u r e   i n t o   a   d i a g r a m m i n g   t o o l   t o   c r e a t e   a   v i s u a l   r e p r e s e n t a t i o n .   L e t   m e   k n o w   i f   y o u ' d   l i k e   f u r t h e r   c l a r i f i c a t i o n ! 
 
 
