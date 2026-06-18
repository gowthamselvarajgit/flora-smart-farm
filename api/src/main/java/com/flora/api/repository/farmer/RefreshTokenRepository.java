package com.flora.api.repository.farmer;

import com.flora.api.entity.farmer.Farmer;
import com.flora.api.entity.farmer.Land;
import com.flora.api.entity.farmer.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);
    // SELECT * FROM refresh_tokens WHERE token = ?
    // Used when app sends refresh token to get new access token
    // Returns Optional — empty if token not found (invalid or deleted)

    void deleteByFarmer(Farmer farmer);
    // DELETE FROM refresh_tokens WHERE farmer_id = ?
    // Called during logout — removes all tokens for this farmer
    // Gowtham logs out → all his devices are logged out

    @Modifying
    @Query("UPDATE RefreshToken r SET r.isRevoked = true WHERE r.farmer = :farmer")
    void revokeAllByFarmer(Farmer farmer);
    // UPDATE refresh_tokens SET is_revoked = true WHERE farmer_id = ?
    // Used when farmer changes password — invalidate all existing sessions
    // Safer than delete — keeps audit trail of old tokens

    long countByFarmerAndIsRevokedFalse(Farmer farmer);
    // SELECT COUNT(*) FROM refresh_tokens
    // WHERE farmer_id = ? AND is_revoked = false
    // Tells us how many active devices Gowtham is logged in on
    // Future use: limit to 5 active devices max

}
