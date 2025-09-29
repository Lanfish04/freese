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


async function updateDataProfile(req, res) {    
    try {
        if (!req.user || !req.user.id) {    
            return res.status(401).json({ error: "User tidak ditemukan atau belum login" });
        }

        const updatedProfile = await profileService.updateMyDataProfile(req.user.id, req.body);

        if (!updatedProfile) {
            return res.status(404).json({ error: "Profile tidak ditemukan" });
        }       
        const safeProfile = {
            id: updatedProfile.id,
            full_name: updatedProfile.full_name,
            phone: updatedProfile.phone,
            role: updatedProfile.role,
            ...(updatedProfile.Farmers && { Farmers: updatedProfile.Farmers }),
            ...(updatedProfile.Buyers && { Buyers: updatedProfile.Buyers })
        };

        res.status(200).json({
            message: "Berhasil Memperbarui Profile",
            profile: safeProfile
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

async function updateAkunProfile(req, res) {
    try {
        if (!req.user || !req.user.id) {    
            return res.status(401).json({ error: "User tidak ditemukan atau belum login" });
        }

        // Ambil data user lama
        const userLama = await prisma.users.findUnique({
            where: { id: req.user.id }
        });

        if (!userLama) {
            return res.status(404).json({ error: "User tidak ditemukan" });
        }
        let newEmail = req.body.email || userLama.email;

        if (newEmail !== userLama.email) {
            const existingUser = await prisma.users.findUnique({
                where: { email: newEmail }
            });

            if (existingUser) {
                return res.status(400).json({ error: "Email sudah dipakai user lain" });
            }
        }

        
        const updatedAkun = await prisma.users.update({
            where: { id: req.user.id },
            data: {
                email: newEmail,
                full_name: req.body.full_name || userLama.full_name,
                phone: req.body.phone || userLama.phone,
                photo: req.body.photo || userLama.photo
            },
            select: {
                id: true,
                email: true,
                role: true
            }
        });

        res.status(200).json({
            message: "Berhasil memperbarui akun",
            akun: updatedAkun
        });

    } catch (error) {
        console.error("Error updating akun:", error);
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
    updateDataProfile,
    updateAkunProfile,
    deleteProfile    
};
        