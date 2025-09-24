const profileService = require("../service/profileService");
const prisma = require("../config/prisma");



async function getOtherProfile(req, res) {
    try {
        const {id} = req.params;
        if (!req.user || !req.user.id) {    
            return res.status(401).json({ error: "User tidak ditemukan atau belum login" });
        }

        const profile = await profileService.getProfileById(id);
        if (!profile) {
            return res.status(404).json({ error: "Profile tidak ditemukan"});
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

        const updatedProfile = await profileService.updateProfileById(req.user.id, req.body);

        if (!updatedProfile) {
            return res.status(404).json({ error: "Profile tidak ditemukan" });
        }       

        // Filter response -> jangan kirim email / password
        const safeProfile = {
            id: updatedProfile.id,
            name: updatedProfile.name,
            phone: updatedProfile.phone,
            role: updatedProfile.role,
            ...(updatedProfile.Farmers && { Farmers: updatedProfile.Farmers }),
            ...(updatedProfile.Buyers && { Buyers: updatedProfile.Buyers })
        };

        res.status(200).json({
            message: "Profile updated successfully",
            profile: safeProfile
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

async function deleteProfile(req, res) {
    try {
        if (!req.user || !req.user.id) {    
            return res.status(401).json({ error: "User tidak ditemukan atau belum login" });
        }
        const deletedProfile = await profileService.deleteProfileById(req.user.id);
        if (!deletedProfile) {
            return res.status(404).json({ error: "Profile tidak ditemukan" });
        }
        res.status(200).json({ message: "Profile deleted successfully" });
    } catch (error) {
        console.error("Error deleting profile:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}


module.exports = {
    getOtherProfile,
    getMyProfile,
    updateProfile,
    deleteProfile    
};
        