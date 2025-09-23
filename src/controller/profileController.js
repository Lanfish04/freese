const profileService = require("../service/profileService");
const prisma = require("../config/prisma");



async function getOtherProfile(req, res) {
    try {
        const {id} = req.params;
        if (!req.user || !req.user.id) {    
            return res.status(401).json({ error: "User tidak ditemukan atau belum login" });
        }

        const profile = await profileService.getProfileById(id, res);
        if (!profile) {
            return res.status(404).json({ error: "Profile tidak ditemukan" });
        }
        res.status(200).json(profile);
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ error: "Internal server error" });
    }   
}

async  function getMyProfile(req, res) {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "User tidak ditemukan atau belum login" });
        }

        const profile = await profileService.getProfileById(req.user.id, req.user.role);  
        if (!profile) {
            return res.status(404).json({ error: "Profile tidak ditemukan" });
        }
        res.status(200).json(profile);
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ error: "Internal server error" });
    }   
}


async function updateProfile(req, res) {    
    try {
        if (!req.user || !req.user.id) {    
            return res.status(401).json({ error: "User tidak ditemukan atau belum login" });
        }
        const updatedProfile = await profileService.updateProfile(req.user.id, req.body);
        if (!updatedProfile) {
            return res.status(404).json({ error: "Profile tidak ditemukan" });
        }       
        res.status(200).json({
            message: "Profile updated successfully",
            profile: updatedProfile
        });
    }   
    catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = {
    getOtherProfile,
    getMyProfile,
    updateProfile
};
        